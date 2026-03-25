let pageOptions = []; // {text, path}
let selectedTabId = null;
let selectedBiz = "";
let _skipLocalMatch = false; // flag to bypass local matching on force AI ask

document.getElementById('settings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// Removed legacy "Open as window" behavior

function formatQuestionWithOptions(question, options) {
  try {
    const optLines = (options || []).map((o, idx) => {
      const letter = String.fromCharCode(65 + idx);
      const text = (o && o.text ? String(o.text) : '').trim();
      return `${letter}. ${text}`;
    });
    const parts = [String(question || '').trim(), ...optLines].filter(Boolean);
    return parts.join("\n");
  } catch (_) {
    return String(question || '');
  }
}

document.getElementById('captureScreen').addEventListener('click', async () => {
  const res = document.getElementById('results');
  try {
    const tab = await getTargetTab();
    if (!tab || !/^https?:/i.test(tab.url || "")) {
      res.innerHTML = "Vui lòng chọn tab web để chụp ảnh.";
      return;
    }

    res.innerHTML = "Đang kích hoạt chụp ảnh...";

    // Re-enable origin permission for robust inject in popup/iframe
    await ensureOriginPermission(tab);

    // Switch to target tab/window first
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });

    // Inject capture script and start selection
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['capture-region.js']
    });

    // Listen for capture result
    const checkResult = async () => {
      const { lastCapture } = await chrome.storage.local.get({ lastCapture: null });
      if (lastCapture) {
        // Clear storage
        await chrome.storage.local.remove(['lastCapture']);

        // Display captured image
        res.innerHTML = `
          <div><strong>✅ Chụp ảnh thành công!</strong></div>
          <div style="margin-top:8px;">
            <img src="${lastCapture}" style="max-width:100%; max-height:300px; border:1px solid #ddd; border-radius:4px;" />
          </div>
          <div style="margin-top:8px; font-size:12px; color:#666;">
            Tab: ${tab.title || tab.url}<br/>
            URL: ${tab.url}<br/>
            Kích thước: ${Math.round(lastCapture.length * 0.75 / 1024)}KB
          </div>
          <div style="margin-top:8px;">
            <button id="copyToClipboard" style="padding:6px 12px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">
              Copy vào Clipboard
            </button>
          </div>
        `;

        // Add event listeners for buttons

        document.getElementById('copyToClipboard').addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(lastCapture);
            alert("Đã copy ảnh vào Clipboard!");
          } catch (e) {
            alert("Không thể copy vào Clipboard: " + e.message);
          }
        });

        return true;
      }
      return false;
    };

    // Check for result every 500ms for up to 30 seconds
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds
    const checkInterval = setInterval(async () => {
      attempts++;
      if (await checkResult() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        if (attempts >= maxAttempts) {
          res.innerHTML = "Timeout: Không nhận được kết quả chụp ảnh.";
        }
      }
    }, 500);

  } catch (e) {
    res.innerHTML = `Lỗi chụp ảnh: ${e.message}. Nếu là cửa sổ popup/iframe, hãy cấp quyền Origin cho miền này rồi thử lại.`;
  }
});

// Inline "Mở dạng tab" button
document.getElementById('openAsTabInline').addEventListener('click', async () => {
  const res = document.getElementById('results');
  try {
    const tab = await getTargetTab();
    if (!tab || !/^https?:/i.test(tab.url || "")) {
      res.innerHTML = "Vui lòng chọn tab web để mở dạng tab thường.";
      return;
    }
    const created = await chrome.tabs.create({ url: tab.url });
    if (created) res.innerHTML = "Đã mở trang thành tab mới. Hãy chuyển sang tab mới.";
  } catch (e) {
    res.innerHTML = `Không thể mở dạng tab: ${e.message || e}`;
  }
});

document.getElementById('pullFromPage').addEventListener('click', async () => {
  const res = document.getElementById('results');
  try {
    const tab = await getTargetTab();
    if (!tab || !/^https?:/i.test(tab.url || "")) {
      res.innerHTML = "Please select a web tab (http/https) in the picker above.";
      return;
    }
    // Ensure origin permission then focus + message/inject retry
    await ensureOriginPermission(tab);
    await chrome.windows.update(tab.windowId, { focused: true });
    await chrome.tabs.update(tab.id, { active: true });

    let found = false;
    // Try main frame first
    try {
      const resp = await sendGetOptions(tab);
      if (resp && Array.isArray(resp.options) && resp.options.length) {
        pageOptions = resp.options; found = true;
        const qEl = document.getElementById('question');
        if (qEl && resp.question) qEl.value = formatQuestionWithOptions(extractQuestionOnly(resp.question), pageOptions);
      }
    } catch (_) { }

    // If not found, iterate all frames explicitly (Saba often renders inside inner frames)
    if (!found) {
      try {
        const frames = await chrome.webNavigation.getAllFrames({ tabId: tab.id });
        for (const f of frames) {
          try {
            const r = await chrome.tabs.sendMessage(tab.id, { type: "GET_QUESTION_OPTIONS" }, { frameId: f.frameId });
            if (r && Array.isArray(r.options) && r.options.length) {
              pageOptions = r.options;
              const qEl = document.getElementById('question');
              if (qEl && r.question) qEl.value = formatQuestionWithOptions(extractQuestionOnly(r.question), pageOptions);
              found = true; break;
            }
          } catch (_) { }
        }
      } catch (_) { }
    }

    if (!found) {
      // Last-resort fallback: execute a small extractor directly in all frames
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id, allFrames: true },
          func: () => {
            try {
              // Scope by radio group nearest viewport center
              const centerY = (window.scrollY || 0) + window.innerHeight / 2;
              const radios = Array.from(document.querySelectorAll('input[type="radio"][name^="qrespbn."]'))
                .filter(r => {
                  const s = window.getComputedStyle(r);
                  return s.display !== 'none' && s.visibility !== 'hidden';
                });

              let options = [];
              let q = '';

              if (radios.length >= 2) {
                // Group by name, pick nearest
                const groups = new Map();
                for (const r of radios) {
                  const arr = groups.get(r.name) || [];
                  arr.push(r); groups.set(r.name, arr);
                }
                let bestName = null, bestDist = Infinity;
                for (const [name, arr] of groups.entries()) {
                  const top = arr[0].getBoundingClientRect().top + window.scrollY;
                  if (Math.abs(top - centerY) < bestDist) { bestDist = Math.abs(top - centerY); bestName = name; }
                }
                if (bestName) {
                  const grp = groups.get(bestName);
                  options = grp.map(r => {
                    let lbl = document.querySelector(`label[for="${r.id}"]`);
                    if (!lbl) { const c = r.closest('.scp-dbtncont'); if (c) lbl = c.querySelector('label'); }
                    return lbl ? { text: (lbl.innerText || '').trim(), path: '' } : null;
                  }).filter(Boolean);
                  // Find question text for THIS radio group via DOM ancestry
                  const firstRadio = grp[0];
                  // Method A: Walk up to find ancestor containing .scp-qtext
                  let ancestor = firstRadio.closest('.scp-dbtncont')?.parentElement || firstRadio.parentElement;
                  let depth = 0;
                  while (ancestor && depth < 8) {
                    const qT = ancestor.querySelector('.scp-qtext');
                    if (qT && ancestor.contains(firstRadio)) { q = (qT.innerText || '').trim(); break; }
                    ancestor = ancestor.parentElement; depth++;
                  }
                  // Method B: Previous sibling walk
                  if (!q) {
                    let el = firstRadio.closest('.scp-dbtncont'); let d2 = 0;
                    while (el && d2 < 6) {
                      let prev = el.previousElementSibling; let h = 0;
                      while (prev && h < 3) {
                        if (prev.classList?.contains('scp-qtext')) { q = (prev.innerText || '').trim(); break; }
                        const nested = prev.querySelector('.scp-qtext');
                        if (nested) { q = (nested.innerText || '').trim(); break; }
                        prev = prev.previousElementSibling; h++;
                      }
                      if (q) break;
                      el = el.parentElement; d2++;
                    }
                  }
                  // Method C: Position fallback
                  if (!q) {
                    const firstTop = firstRadio.getBoundingClientRect().top;
                    let bestDist = Infinity;
                    document.querySelectorAll('.scp-qtext').forEach(el => {
                      const bottom = el.getBoundingClientRect().bottom;
                      const dist = firstTop - bottom;
                      if (dist >= -20 && dist < bestDist) { bestDist = dist; q = (el.innerText || '').trim(); }
                    });
                  }
                }
              }

              // Fallback to broad selector if radio scoping failed
              if (!options.length) {
                const labelSel = '.scp-dbtncont label, .scp-dbtntxt label';
                const labels = Array.from(document.querySelectorAll(labelSel));
                options = labels.map(l => ({ text: (l.innerText || '').trim(), path: '' }));
                q = (document.querySelector('.scp-qtext')?.innerText || '').trim();
              }

              return { ok: true, question: q, options };
            } catch (e) { return { ok: false, error: e.message }; }
          }
        });
        for (const r of (results || [])) {
          const resv = r?.result;
          if (resv && resv.options && resv.options.length) {
            pageOptions = resv.options.map(o => ({ text: (o.text || '').trim(), path: '' }));
            const qEl = document.getElementById('question');
            if (qEl && resv.question) qEl.value = formatQuestionWithOptions(extractQuestionOnly(resv.question), pageOptions);
            found = true; break;
          }
        }
      } catch (_) { }
    }

    if (!found) pageOptions = [];
    // Try to auto-fill question from current selection (always overwrite if there is a selection)
    try {
      const [{ result: selText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => (window.getSelection()?.toString() || "").trim()
      });
      const qEl = document.getElementById('question');
      if (qEl && selText) qEl.value = selText;
    } catch (_) { }

    if (!pageOptions.length) {
      res.innerHTML = "No options found. Try focusing the question area or scroll into view.";
    } else {
      const list = pageOptions.map((o, i) => {
        const hasImg = o.img && (o.img.src || o.img.alt);
        const label = [o.text, hasImg ? `[img:${escapeHtml(o.img.alt || '')}]` : ""].filter(Boolean).join(" ");
        return `${i + 1}. ${escapeHtml(label)}`;
      }).join('<br/>');
      res.innerHTML = `<div><strong>Detected options:</strong></div><div style="margin-top:6px;">${list}</div>`;
    }
  } catch (e) {
    res.innerHTML = `Cannot read options on the selected tab. Ensure the page is loaded and allowed by host patterns. (${e.message || e})`;
  }
});

// ── Open Notebook Chat Helper ──
async function notebookChat(apiUrl, notebookId, password, questionText, sessionMode = 'reuse') {
  const base = apiUrl.replace(/\/+$/, '');

  const headers = {
    "Content-Type": "application/json",
    ...(password ? { "Authorization": `Bearer ${password}` } : {})
  };

  // Helper: create a new session and optionally save to local storage
  async function createNewSession(save = false) {
    const sessionResp = await fetch(`${base}/api/chat/sessions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ notebook_id: notebookId })
    });
    if (!sessionResp.ok) throw new Error(`Tạo session thất bại: HTTP ${sessionResp.status}`);
    const session = await sessionResp.json();
    if (save) {
      await chrome.storage.local.set({
        currentSessionId: session.id,
        currentSessionNotebookId: notebookId
      });
    }
    return session;
  }

  // Step 1: Get or create session based on mode
  let session;
  if (sessionMode === 'reuse') {
    // Try to reuse existing session
    const stored = await chrome.storage.local.get({ currentSessionId: null, currentSessionNotebookId: null });
    if (stored.currentSessionId && stored.currentSessionNotebookId === notebookId) {
      session = { id: stored.currentSessionId };
    } else {
      // No existing session or different notebook → create new & save
      session = await createNewSession(true);
    }
  } else {
    // Mode "new" — always create a fresh session (original behavior)
    session = await createNewSession(false);
  }

  // Step 2: Build context (all sources/notes)
  const contextResp = await fetch(`${base}/api/chat/context`, {
    method: "POST",
    headers,
    body: JSON.stringify({ notebook_id: notebookId, context_config: {} })
  });
  if (!contextResp.ok) throw new Error(`Build context thất bại: HTTP ${contextResp.status}`);
  const contextData = await contextResp.json();

  // Step 3: Execute chat
  let chatResp = await fetch(`${base}/api/chat/execute`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      session_id: session.id,
      message: questionText,
      context: contextData.context
    })
  });

  // If reuse mode and chat failed → session might be expired, retry with new session
  if (!chatResp.ok && sessionMode === 'reuse') {
    console.warn(`[NotebookChat] Session ${session.id} failed (HTTP ${chatResp.status}), creating new session...`);
    session = await createNewSession(true);
    chatResp = await fetch(`${base}/api/chat/execute`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        session_id: session.id,
        message: questionText,
        context: contextData.context
      })
    });
  }

  if (!chatResp.ok) throw new Error(`Chat thất bại: HTTP ${chatResp.status}`);
  return await chatResp.json();
}

/**
 * Lightweight markdown-to-HTML converter.
 * Handles **bold**, *italic*, bullet lists, line breaks,
 * and [source_insight:...] / [source:...] citation tags.
 */
function simpleMarkdownToHtml(text) {
  if (!text) return '';
  // Escape HTML entities first
  let html = escapeHtml(text);

  // Convert **bold**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Convert *italic* (but not inside <strong> opening/closing)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  // Convert [source_insight:...] and [source:...] citation tags
  html = html.replace(/\[source_insight:([^\]]+)\]/g, '<span class="cit">[source: $1]</span>');
  html = html.replace(/\[source:([^\]]+)\]/g, '<span class="cit">[source: $1]</span>');

  // Split into lines for list detection
  const lines = html.split('\n');
  const result = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^[-*]\s+(.*)/);
    if (listMatch) {
      if (!inList) { result.push('<ul>'); inList = true; }
      result.push(`<li>${listMatch[1]}</li>`);
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      if (trimmed === '') {
        result.push('<br>');
      } else {
        result.push(`<p style="margin:0 0 4px 0;">${line}</p>`);
      }
    }
  }
  if (inList) result.push('</ul>');

  return result.join('\n');
}

function renderNotebookResult(data) {
  const el = document.getElementById('results');
  const aiMessages = (data.messages || []).filter(m => m.type === 'ai');
  const lastAI = aiMessages[aiMessages.length - 1];
  const content = lastAI ? lastAI.content : "Không có phản hồi từ AI.";
  el.innerHTML = `<div style="padding:12px; background:#EDF7ED; border-radius:8px; border-left:4px solid #4CAF50;">
    <div style="font-weight:600; color:#2E7D32; margin-bottom:6px;">🤖 ChatBot - HNA Soft</div>
    <div class="md-content">${simpleMarkdownToHtml(content)}</div>
  </div>`;
}

document.getElementById('ask').addEventListener('click', async () => {
  const q = document.getElementById('question').value.trim();
  if (!q) return alert("Please enter or select a question.");
  // Load API credentials from bundled config.json (not user-editable)
  let cfgDefaults = {};
  try {
    const resp = await fetch(chrome.runtime.getURL('config.json'));
    if (resp.ok) cfgDefaults = await resp.json();
  } catch (_) { }

  const cfg = await chrome.storage.sync.get({
    hostPatterns: "",
    localBankFiles: "data/cong-nghe-so.json",
    sessionMode: cfgDefaults.sessionMode || "reuse"
  });
  cfg.notebookApiUrl = cfgDefaults.notebookApiUrl || "";
  cfg.notebookId = cfgDefaults.notebookId || "";
  cfg.notebookApiPassword = cfgDefaults.notebookApiPassword || "";

  const tab = await getTargetTab();

  if (cfg.hostPatterns) {
    const ok = cfg.hostPatterns
      .split(/\r?\n/)
      .filter(Boolean)
      .some(rx => new RegExp(rx).test(tab.url || ""));
    if (!ok) return alert("This site is not allowed by your host patterns.");
  }

  // Extract question-only text (strip options from textarea)
  const questionOnly = extractQuestionOnly(q);
  let optionTexts = pageOptions.map(o => o.text);

  // Fallback: if pageOptions is empty, parse option lines from textarea text
  if (!optionTexts.length) {
    const lines = q.split(/\r?\n/);
    for (const line of lines) {
      const m = line.trim().match(/^[A-Fa-f][.):\-\s]\s*(.*)/);
      if (m && m[1].trim()) optionTexts.push(m[1].trim());
    }
    console.log('[Popup] Parsed options from textarea fallback:', optionTexts);
  }

  // ── LOCAL MATCHING (try first, unless force-AI) ──
  const skipLocal = _skipLocalMatch;
  _skipLocalMatch = false;

  if (!skipLocal) {
    renderLocalSearching();
    try {
      const bankPaths = (cfg.localBankFiles || '')
        .split(/[,;\n]/)
        .map(s => s.trim())
        .filter(Boolean);

      if (bankPaths.length && typeof AnswerBank !== 'undefined') {
        const bank = await AnswerBank.loadAnswerBank(bankPaths);
        const localResult = AnswerBank.findLocalAnswer(questionOnly, optionTexts, bank);

        if (localResult) {
          renderLocalResult(localResult);

          // Send highlight to content script
          try {
            await chrome.tabs.sendMessage(tab.id, {
              type: "ANNOTATE_RANKING",
              ranking: [],
              answer: localResult.mappedAnswer,
              citations: []
            });
          } catch (_) { }
          return; // Done — local match found
        }

        // No local match found — show message with AI fallback option
        renderNoLocalMatch();
        return;
      }
    } catch (e) {
      console.warn('[LocalMatch] Error:', e);
    }
  } // end if(!skipLocal)

  // ── OPEN NOTEBOOK API ──
  if (!cfg.notebookApiUrl || !cfg.notebookId) {
    document.getElementById('results').innerHTML = `<div style="color:#dc2626;">❌ Chưa cấu hình ChatBot trong Cài đặt. Vui lòng vào Cài đặt, nhấn Lưu cài đặt để cấu hình ChatBot.</div>`;
    return;
  }

  document.getElementById('results').innerHTML = "🤖 Đang hỏi ChatBot…";
  try {
    const data = await notebookChat(
      cfg.notebookApiUrl,
      cfg.notebookId,
      cfg.notebookApiPassword,
      q,
      cfg.sessionMode || 'reuse'
    );
    renderNotebookResult(data);
  } catch (e) {
    document.getElementById('results').innerHTML = `<div style="color:#dc2626;">❌ ChatBot Error: ${escapeHtml(e.message)}</div>`;
  }
});

// ── "Hỏi AI" button — skip local matching, use Open Notebook API ──
document.getElementById('askAI').addEventListener('click', () => {
  _skipLocalMatch = true;
  document.getElementById('ask').click();
});



function renderLocalSearching() {
  document.getElementById('results').innerHTML = "🔍 Đang tìm trong ngân hàng câu hỏi cục bộ…";
}

function renderNoLocalMatch() {
  const el = document.getElementById('results');
  el.innerHTML = `<div style="padding:12px; background:#FFF3E0; border-radius:8px; border-left:4px solid #FF9800; text-align:center;">
    <div style="font-weight:600; color:#E65100; margin-bottom:8px;">⚠️ Không có câu hỏi trùng khớp trong bộ đề cục bộ</div>
    <div style="color:#555; font-size:12px; margin-bottom:10px;">Bạn có thể thử hỏi AI để tìm đáp án</div>
    <button id="noMatchAskAI" class="btn btn-ai" style="width:100%; font-size:13px;">
      ✨ Hỏi AI
    </button>
  </div>`;
  document.getElementById('noMatchAskAI')?.addEventListener('click', () => {
    _skipLocalMatch = true;
    document.getElementById('ask').click();
  });
}

function renderLocalResult(result) {
  const el = document.getElementById('results');
  const scorePercent = Math.round(result.questionScore * 100);
  const optScore = Math.round(result.optionMappingScore * 100);
  const allMatches = result.allMatches || [];

  let html = `<div style="padding:10px; background:#e8f5e9; border-radius:8px; border-left:4px solid #4caf50; margin-bottom:8px;">`;
  html += `<div style="font-weight:600; color:#2e7d32; margin-bottom:6px;">📚 Tìm thấy đáp án cục bộ! (${scorePercent}% khớp)</div>`;
  html += `<div style="margin-bottom:6px; padding:6px 8px; background:#f1f8e9; border-radius:4px; font-size:12px; color:#555;"><strong>📝 Câu hỏi trong đề:</strong> ${escapeHtml(result.matchedQuestion || '')}</div>`;

  // Show all options A/B/C/D from bank
  if (result.bankOptions) {
    const optLetters = Object.keys(result.bankOptions).filter(k => /^[A-F]$/i.test(k)).sort();
    if (optLetters.length) {
      html += `<div style="margin:4px 0 6px 4px; font-size:12px; color:#555;">`;
      for (const l of optLetters) {
        const isCorrect = l.toUpperCase() === result.mappedAnswer;
        html += `<div style="${isCorrect ? 'font-weight:600; color:#2e7d32;' : ''}">${escapeHtml(l)}. ${escapeHtml(result.bankOptions[l] || '')}</div>`;
      }
      html += `</div>`;
    }
  }

  html += `<div style="margin-bottom:4px;"><strong>Đáp án: ${escapeHtml(result.mappedAnswer)}</strong></div>`;
  html += `<div style="margin-bottom:4px; color:#555;">${escapeHtml(result.mappedAnswerText)}</div>`;

  if (result.originalAnswer !== result.mappedAnswer) {
    html += `<div style="font-size:12px; color:#888; margin-bottom:4px;">📎 Đáp án gốc: ${escapeHtml(result.originalAnswer)}. ${escapeHtml(result.originalAnswerText)} → Đã ánh xạ sang ${escapeHtml(result.mappedAnswer)} (${optScore}% khớp)</div>`;
  }

  if (result.explanation) {
    html += `<div style="margin-top:6px; padding:6px 8px; background:#f1f8e9; border-radius:4px; font-size:13px;"><em>💡 ${escapeHtml(result.explanation)}</em></div>`;
  }
  html += `</div>`;

  // ── All Matches List ──
  if (allMatches.length > 1) {
    html += `<div style="margin-top:6px;">`;
    html += `<details>`;
    html += `<summary style="cursor:pointer; font-weight:600; color:#1565c0; padding:4px 0;">📋 Tất cả câu khớp (${allMatches.length} câu)</summary>`;
    html += `<div style="margin-top:6px;">`;

    for (let i = 0; i < allMatches.length; i++) {
      const m = allMatches[i];
      const mScore = Math.round(m.questionScore * 100);
      const isBest = i === 0;
      const bgColor = isBest ? '#e8f5e9' : '#f5f5f5';
      const borderColor = isBest ? '#4caf50' : '#ddd';

      html += `<div style="padding:8px; background:${bgColor}; border-left:3px solid ${borderColor}; border-radius:4px; margin-bottom:6px; font-size:13px;">`;
      html += `<div style="font-weight:600; color:#333;">${isBest ? '⭐' : `#${i + 1}`} (${mScore}% khớp)</div>`;
      html += `<div style="margin-top:3px; color:#555;"><strong>Câu hỏi:</strong> ${escapeHtml((m.question || '').substring(0, 120))}${m.question?.length > 120 ? '...' : ''}</div>`;
      html += `<div style="margin-top:2px; color:#2e7d32;"><strong>Đáp án đúng:</strong> ${escapeHtml(m.answerLetter)}. ${escapeHtml(m.answerText)}</div>`;

      // Show all options from bank
      if (m.options) {
        const optLetters = Object.keys(m.options).filter(k => /^[A-F]$/i.test(k)).sort();
        if (optLetters.length) {
          html += `<div style="margin-top:3px; font-size:12px; color:#777;">`;
          for (const l of optLetters) {
            const isCorrect = l.toUpperCase() === m.answerLetter;
            html += `<div style="${isCorrect ? 'font-weight:600; color:#2e7d32;' : ''}">${escapeHtml(l)}. ${escapeHtml(m.options[l] || '')}</div>`;
          }
          html += `</div>`;
        }
      }

      html += `</div>`;
    }

    html += `</div></details></div>`;
  }

  // Fallback button to force AI
  html += `<button id="forceAskAI" class="btn btn-outline" style="width:100%; margin-top:4px; font-size:12px;">Không khớp? ✨ Hỏi AI ▶</button>`;

  el.innerHTML = html;

  // Bind fallback button
  document.getElementById('forceAskAI')?.addEventListener('click', () => {
    _skipLocalMatch = true;
    document.getElementById('ask').click();
  });
}

function escapeHtml(s) { return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }[m])); }

// Extract only question text (remove options starting with a./b./c./d. or A/B/C/D, 'xem hướng dẫn giải', etc.)
function extractQuestionOnly(text) {
  if (!text) return "";
  // Normalize newlines
  const lines = String(text).split(/\r?\n/);
  // Find the first line that looks like an option and cut before it
  const idx = lines.findIndex(l => /^(\s*[a-dA-D][\.)\-: ]\s|\s*\d+\)|\s*•\s)/.test(l.trim()));
  let questionPart = idx >= 0 ? lines.slice(0, idx).join(" ") : text;
  // Remove trailing helper phrases commonly found at the end
  questionPart = questionPart.replace(/xem\s+hướng\s+dẫn\s+giải.*$/i, "").trim();
  return questionPart;
}

// ---- Tab/window selection helpers ----
async function populateTabs() {
  const select = document.getElementById('tabPicker');
  if (!select) return;
  select.innerHTML = "";
  const allTabs = await chrome.tabs.query({ currentWindow: false });
  for (const t of allTabs) {
    const url = t.url || "";
    if (!/^https?:/i.test(url)) continue;
    const opt = document.createElement('option');
    opt.value = String(t.id);
    const title = (t.title || '').slice(0, 80) || t.url || 'Untitled';
    opt.textContent = `[W${t.windowId}] ${title}`;
    select.appendChild(opt);
  }
  if (!selectedTabId) {
    // Prefer active tab of the last focused normal window with http/https URL
    try {
      const activeTabs = allTabs.filter(t => t.active && /^https?:/i.test(t.url || ""));
      const active = activeTabs[0];
      if (active) selectedTabId = active.id;
    } catch (_) { }
  }
  if (selectedTabId) select.value = String(selectedTabId);
  select.addEventListener('change', () => { selectedTabId = Number(select.value); });
}

async function getTargetTab() {
  if (selectedTabId != null) {
    try {
      const tab = await chrome.tabs.get(selectedTabId);
      if (tab) return tab;
    } catch (_) { }
  }
  try {
    const win = await chrome.windows.getLastFocused({ populate: true });
    const active = (win.tabs || []).find(t => t.active && /^https?:/i.test(t.url || ""));
    if (active) { selectedTabId = active.id; return active; }
  } catch (_) { }
  // fallback: any http tab
  const any = (await chrome.tabs.query({})).find(t => /^https?:/i.test(t.url || ""));
  selectedTabId = any?.id || null;
  return any;
}

document.getElementById('refreshTabs').addEventListener('click', () => populateTabs());
populateTabs();

async function ensureContentScriptInjected(tabId) {
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }); } catch (_) { }
}

async function activateAndInject(tabId) {
  try { await chrome.tabs.update(tabId, { active: true }); } catch (_) { }
  try { await chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }); } catch (_) { }
}

async function sendGetOptions(tab) {
  try {
    return await chrome.tabs.sendMessage(tab.id, { type: "GET_QUESTION_OPTIONS" });
  } catch (e) {
    await ensureOriginPermission(tab);
    await activateAndInject(tab.id);
    return await chrome.tabs.sendMessage(tab.id, { type: "GET_QUESTION_OPTIONS" });
  }
}

async function ensureOriginPermission(tab) {
  try {
    const origin = new URL(tab.url || '').origin + '/*';
    if (!origin || origin === 'null/*') return;
    await chrome.permissions.request({ origins: [origin] });
  } catch (_) { }
}

// ---- Business picker ----
const BIZ_LIST_BOTTOM_TO_TOP = [
  "Tín dụng cá nhân",
  "Tín dụng doanh nghiệp",
  "Kế toán giao dịch khách hàng",
  "Kế toán giao dịch nội bộ",
  "Thẩm định",
  "Kế hoạch và quản lý rủi ro",
  "Kiểm tra giám sát nội bộ",
  "Thanh toán quốc tế và Tài trợ thương mại",
  "Công nghệ thông tin",
  "Kiểm ngân",
  "Pháp chế",
  "Nhân sự - Tiền lương",
  "Văn thư, lễ tân",
  "Xây dựng cơ bản, Quản trị hành chính",
  "Xử lý nợ"
];

async function populateBiz() {
  const sel = document.getElementById('bizPicker');
  if (!sel) return;
  sel.innerHTML = "";
  const { savedBiz } = await chrome.storage.sync.get({ savedBiz: "" });
  for (const name of BIZ_LIST_BOTTOM_TO_TOP) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    sel.appendChild(opt);
  }
  if (savedBiz && BIZ_LIST_BOTTOM_TO_TOP.includes(savedBiz)) sel.value = savedBiz;
  selectedBiz = sel.value || "";
  sel.addEventListener('change', async () => {
    selectedBiz = sel.value || "";
    await chrome.storage.sync.set({ savedBiz: selectedBiz });
  });
}

populateBiz();
