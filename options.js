/**
 * options.js — Settings page logic
 * Tab switching, general settings, question bank management,
 * and Excel upload (SheetJS).
 */

// ── Tab Switching ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.getElementById(`tab-${tabId}`).classList.add('active');
    sessionStorage.setItem('activeTab', tabId);
    if (tabId === 'bank') loadBankList();
  });
});

const savedTab = sessionStorage.getItem('activeTab');
if (savedTab) {
  const btn = document.querySelector(`.tab-btn[data-tab="${savedTab}"]`);
  if (btn) btn.click();
}

// ── Toast Utility ──
function showToast(id, text, isError = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? '#dc2626' : '#16a34a';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

// ═══════════════════════════════════════════
// TAB 1: GENERAL SETTINGS
// ═══════════════════════════════════════════

(async function loadGeneralSettings() {
  // Load defaults from config.json shipped with the extension
  let defaults = { sessionMode: "reuse" };
  try {
    const resp = await fetch(chrome.runtime.getURL('config.json'));
    if (resp.ok) defaults = await resp.json();
  } catch (_) {}

  const cfg = await chrome.storage.sync.get({
    hostPatterns: "",
    sessionMode: defaults.sessionMode || "reuse",
    selectedNotebookId: ""
  });
  document.getElementById('hostPatterns').value = cfg.hostPatterns || "";
  document.getElementById('sessionMode').value = cfg.sessionMode || "reuse";

  // Populate notebook picker from config.json
  const notebookPicker = document.getElementById('notebookPicker');
  let notebooks = defaults.notebooks || [];
  // Backward compatibility: if old notebookId exists and no notebooks array
  if (!notebooks.length && defaults.notebookId) {
    notebooks = [{ id: defaults.notebookId, name: defaults.notebookId }];
  }

  notebookPicker.innerHTML = '';
  if (!notebooks.length) {
    notebookPicker.innerHTML = '<option value="">-- Chưa cấu hình notebook --</option>';
  } else {
    for (const nb of notebooks) {
      const opt = document.createElement('option');
      opt.value = nb.id;
      opt.textContent = nb.name || nb.id;
      notebookPicker.appendChild(opt);
    }
    // Restore saved selection
    if (cfg.selectedNotebookId && notebooks.some(nb => nb.id === cfg.selectedNotebookId)) {
      notebookPicker.value = cfg.selectedNotebookId;
    } else {
      // Default to first notebook
      notebookPicker.value = notebooks[0].id;
    }
  }
})();

document.getElementById('saveGeneral').addEventListener('click', async () => {
  const hostPatterns = document.getElementById('hostPatterns').value;
  const sessionMode = document.getElementById('sessionMode').value;
  const selectedNotebookId = document.getElementById('notebookPicker').value;
  await chrome.storage.sync.set({ hostPatterns, sessionMode, selectedNotebookId });
  showToast('statusGeneral', '✅ Đã lưu!');
});

// Toggle password visibility
document.querySelectorAll('.toggle-visibility').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.textContent = isHidden ? '🙈' : '👁️';
  });
});

// ── License Key Activation (Offline) ──
(async function initLicenseUI() {
  // Populate machine code
  try {
    const machineCode = await LicenseManager.getMachineCode();
    const mcInput = document.getElementById('machineCode');
    if (mcInput) mcInput.value = machineCode;
  } catch (_) {}

  // Load saved key
  const { licenseKey } = await chrome.storage.sync.get({ licenseKey: '' });
  const keyInput = document.getElementById('licenseKey');
  if (keyInput && licenseKey) keyInput.value = licenseKey;

  // Auto-check status on page load
  await updateLicenseStatusDisplay();
})();

// Copy machine code to clipboard
document.getElementById('copyMachineCode')?.addEventListener('click', () => {
  const mc = document.getElementById('machineCode');
  if (!mc?.value) return;
  navigator.clipboard.writeText(mc.value).then(() => {
    showToast('statusLicense', '📋 Đã copy mã máy!');
  });
});

async function updateLicenseStatusDisplay() {
  const statusEl = document.getElementById('licenseStatus');
  if (!statusEl) return;
  try {
    const result = await LicenseManager.checkLicense();
    if (result.valid) {
      statusEl.style.display = 'block';
      statusEl.style.background = '#DCFCE7';
      statusEl.style.color = '#166534';
      statusEl.textContent = '✅ Bản quyền hợp lệ — tính năng Hỏi AI đã được kích hoạt';
    } else {
      statusEl.style.display = 'block';
      statusEl.style.background = '#FEF2F2';
      statusEl.style.color = '#991B1B';
      statusEl.textContent = '❌ Chưa kích hoạt hoặc key không hợp lệ';
    }
  } catch (_) {
    statusEl.style.display = 'block';
    statusEl.style.background = '#FEF9C3';
    statusEl.style.color = '#854D0E';
    statusEl.textContent = '⚠️ Không thể kiểm tra bản quyền';
  }
}

document.getElementById('activateLicense').addEventListener('click', async () => {
  const keyInput = document.getElementById('licenseKey');
  const key = (keyInput?.value || '').trim();
  if (!key) return showToast('statusLicense', '❌ Vui lòng nhập key!', true);

  showToast('statusLicense', '⏳ Đang kiểm tra...');

  try {
    // Save key
    await LicenseManager.saveKey(key);

    // Verify offline
    const valid = await LicenseManager.verifyOffline(key);
    if (valid) {
      showToast('statusLicense', '✅ Kích hoạt thành công!');
    } else {
      showToast('statusLicense', '❌ Key không hợp lệ!', true);
    }
    await updateLicenseStatusDisplay();
  } catch (e) {
    showToast('statusLicense', `❌ Lỗi: ${e.message}`, true);
  }
});

// ═══════════════════════════════════════════
// TAB 2: QUESTION BANK MANAGER
// ═══════════════════════════════════════════

// ── Storage Helpers ──
async function getBankFiles() {
  const { localBankFiles, bankFilesInitialized } = await chrome.storage.sync.get({
    localBankFiles: '',
    bankFilesInitialized: false
  });

  // First-time user: no flag set → use default bundled bank
  if (!bankFilesInitialized && !localBankFiles) {
    return ['data/cong-nghe-so.json'];
  }

  // User has modified bank list → use exact saved value (even if empty)
  return (localBankFiles || '')
    .split(/[,;\n]/)
    .map(s => s.trim())
    .filter(Boolean);
}

async function saveBankFiles(files) {
  await chrome.storage.sync.set({ localBankFiles: files.join(',') });
}

async function getStorageBanks() {
  const { questionBanks } = await chrome.storage.local.get({ questionBanks: {} });
  return questionBanks || {};
}

async function saveStorageBanks(banks) {
  await chrome.storage.local.set({ questionBanks: banks });
}

function isBundledFile(path) {
  return path === 'data/cong-nghe-so.json';
}

async function getBankQuestionCount(bankName) {
  const banks = await getStorageBanks();
  if (banks[bankName]) return banks[bankName].length;
  try {
    const url = chrome.runtime.getURL(bankName);
    const resp = await fetch(url);
    if (resp.ok) {
      const data = await resp.json();
      return Array.isArray(data) ? data.length : 0;
    }
  } catch (_) {}
  return 0;
}

// ── Load Bank List ──
async function loadBankList() {
  const listEl = document.getElementById('bankList');
  const files = await getBankFiles();
  const banks = await getStorageBanks();
  const selectEl = document.getElementById('targetBank');

  // Only show banks from the active files list (source of truth)
  const allBanks = new Set(files);

  if (!allBanks.size) {
    listEl.innerHTML = '<div class="bank-empty">Chưa có ngân hàng nào. Tạo mới bên dưới!</div>';
    selectEl.innerHTML = '<option value="">-- Chưa có ngân hàng --</option>';
    return;
  }

  let html = '';
  let selectHtml = '<option value="">-- Chọn --</option>';

  for (const name of allBanks) {
    const count = await getBankQuestionCount(name);
    const isBundled = isBundledFile(name);
    const typeLabel = isBundled ? 'Bundled' : 'Custom';
    const typeClass = isBundled ? 'bundled' : 'custom';

    const clearBtn = !isBundled
      ? `<button class="clear-bank" data-bank="${escapeAttr(name)}" title="Xóa toàn bộ câu hỏi">🧹</button>`
      : '';

    html += `
      <div class="bank-item-wrapper" data-bank="${escapeAttr(name)}">
        <div class="bank-item" data-bank="${escapeAttr(name)}">
          <span class="bank-type ${typeClass}">${typeLabel}</span>
          <span class="bank-name" title="Click để xem danh sách câu hỏi">${escapeHtml(name)}</span>
          <span class="bank-count">${count} câu</span>
          ${clearBtn}
          <button class="btn btn-danger btn-sm delete-bank" data-bank="${escapeAttr(name)}" title="Xoá">🗑️</button>
        </div>
        <div class="bank-questions" id="questions-${escapeAttr(name)}"></div>
      </div>
    `;

    // All banks (both bundled and custom) can be selected for import
    selectHtml += `<option value="${escapeAttr(name)}">${escapeHtml(name)} (${count} câu)</option>`;
  }

  listEl.innerHTML = html;
  selectEl.innerHTML = selectHtml;

  // Bind delete buttons for ALL banks
  listEl.querySelectorAll('.delete-bank').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bankName = btn.dataset.bank;
      const label = isBundledFile(bankName)
        ? `Bỏ ngân hàng "${bankName}" khỏi danh sách active?`
        : `Xoá ngân hàng "${bankName}" và tất cả câu hỏi?`;
      if (!confirm(label)) return;
      await deleteBank(bankName);
    });
  });

  // Bind clear-all buttons
  listEl.querySelectorAll('.clear-bank').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bankName = btn.dataset.bank;
      if (!confirm(`Xóa toàn bộ câu hỏi trong "${bankName}"? (Ngân hàng vẫn được giữ lại)`)) return;
      await clearAllQuestions(bankName);
    });
  });

  // Bind bank-name click to expand/collapse question list
  listEl.querySelectorAll('.bank-name').forEach(nameEl => {
    nameEl.addEventListener('click', async () => {
      const wrapper = nameEl.closest('.bank-item-wrapper');
      const bankName = wrapper.dataset.bank;
      const questionsEl = wrapper.querySelector('.bank-questions');

      // Toggle
      if (questionsEl.classList.contains('expanded')) {
        questionsEl.classList.remove('expanded');
        questionsEl.innerHTML = '';
        return;
      }

      // Collapse all others
      listEl.querySelectorAll('.bank-questions.expanded').forEach(el => {
        el.classList.remove('expanded');
        el.innerHTML = '';
      });

      // Load questions
      await renderQuestionList(bankName, questionsEl);
      questionsEl.classList.add('expanded');
    });
  });
}

// ── Clear All Questions in a Bank ──
async function clearAllQuestions(bankName) {
  const banks = await getStorageBanks();
  banks[bankName] = [];
  await saveStorageBanks(banks);
  showToast('statusBank', `🧹 Đã xóa toàn bộ câu hỏi trong "${bankName}"`);
  await loadBankList();
}

// ── Render Question List (expandable) ──
async function renderQuestionList(bankName, containerEl) {
  const isBundled = isBundledFile(bankName);
  let questions = [];

  // Try storage first
  const banks = await getStorageBanks();
  if (banks[bankName] && banks[bankName].length) {
    questions = banks[bankName];
  } else if (isBundled) {
    // Load from bundled file
    try {
      const url = chrome.runtime.getURL(bankName);
      const resp = await fetch(url);
      if (resp.ok) questions = await resp.json();
    } catch (_) {}
  }

  if (!questions.length) {
    containerEl.innerHTML = '<div style="padding:10px 28px;font-size:12px;color:var(--text-muted);">Ngân hàng trống.</div>';
    return;
  }

  let html = '';
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const qText = escapeHtml((q.question || '').substring(0, 120));
    const deleteBtn = !isBundled
      ? `<button class="q-delete" data-bank="${escapeAttr(bankName)}" data-index="${i}" title="Xóa câu hỏi này">❌</button>`
      : '';
    html += `
      <div class="question-row">
        <span class="q-index">${i + 1}.</span>
        <span class="q-text">${qText}${q.question && q.question.length > 120 ? '…' : ''}</span>
        <span class="q-answer">${escapeHtml(q.answer || '')}</span>
        ${deleteBtn}
      </div>
    `;
  }
  containerEl.innerHTML = html;

  // Bind delete buttons
  containerEl.querySelectorAll('.q-delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      const bName = btn.dataset.bank;
      if (!confirm(`Xóa câu hỏi #${idx + 1}?`)) return;
      await deleteQuestion(bName, idx);
    });
  });
}

// ── Delete Single Question ──
async function deleteQuestion(bankName, index) {
  const banks = await getStorageBanks();
  if (!banks[bankName]) return;
  banks[bankName].splice(index, 1);
  await saveStorageBanks(banks);
  showToast('statusBank', `🗑️ Đã xóa câu hỏi #${index + 1}`);
  await loadBankList();
}

// ═══════════════════════════════════════════
// SEARCH QUESTIONS
// ═══════════════════════════════════════════

const bankSearchInput = document.getElementById('bankSearch');
let _searchTimeout = null;

bankSearchInput.addEventListener('input', () => {
  clearTimeout(_searchTimeout);
  _searchTimeout = setTimeout(() => performSearch(bankSearchInput.value.trim()), 250);
});

async function performSearch(query) {
  const listEl = document.getElementById('bankList');
  const wrappers = listEl.querySelectorAll('.bank-item-wrapper');

  if (!query) {
    // Clear search: show all banks, collapse all
    wrappers.forEach(w => {
      w.classList.remove('hidden');
      const qEl = w.querySelector('.bank-questions');
      qEl.classList.remove('expanded');
      qEl.innerHTML = '';
    });
    return;
  }

  const lowerQuery = query.toLowerCase();

  for (const wrapper of wrappers) {
    const bankName = wrapper.dataset.bank;
    const questionsEl = wrapper.querySelector('.bank-questions');

    // Load questions if not already expanded
    if (!questionsEl.classList.contains('expanded')) {
      await renderQuestionList(bankName, questionsEl);
      questionsEl.classList.add('expanded');
    }

    // Filter question rows
    const rows = questionsEl.querySelectorAll('.question-row');
    let hasMatch = false;
    rows.forEach(row => {
      const text = (row.querySelector('.q-text')?.textContent || '').toLowerCase();
      if (text.includes(lowerQuery)) {
        row.classList.remove('hidden');
        hasMatch = true;
      } else {
        row.classList.add('hidden');
      }
    });

    // Hide entire bank if no matches
    if (hasMatch) {
      wrapper.classList.remove('hidden');
    } else {
      wrapper.classList.add('hidden');
    }
  }
}

// ── Create Bank ──
const newBankNameInput = document.getElementById('newBankName');
const bankNameHint = document.getElementById('bankNameHint');

// Realtime validation: strip invalid characters as user types
newBankNameInput.addEventListener('input', () => {
  const raw = newBankNameInput.value;
  const cleaned = raw.replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
  if (raw !== cleaned) {
    newBankNameInput.value = cleaned;
    bankNameHint.textContent = '⚠️ Chỉ cho phép a-z, 0-9, dấu gạch ngang (-). Ký tự không hợp lệ đã bị loại bỏ.';
    bankNameHint.classList.add('warning');
  } else {
    bankNameHint.textContent = '';
    bankNameHint.classList.remove('warning');
  }
});

document.getElementById('createBank').addEventListener('click', async () => {
  let name = newBankNameInput.value.trim();
  if (!name) return showToast('statusBank', '❌ Nhập tên file!', true);

  name = name.replace(/[^a-zA-Z0-9\-]/g, '').toLowerCase();
  if (!name) return showToast('statusBank', '❌ Tên không hợp lệ!', true);
  const fullName = `data/${name}.json`;

  const files = await getBankFiles();
  if (files.includes(fullName)) {
    return showToast('statusBank', '❌ Ngân hàng đã tồn tại!', true);
  }

  const banks = await getStorageBanks();
  banks[fullName] = [];
  await saveStorageBanks(banks);

  files.push(fullName);
  await saveBankFiles(files);
  await chrome.storage.sync.set({ bankFilesInitialized: true });

  newBankNameInput.value = '';
  bankNameHint.textContent = '';
  showToast('statusBank', `✅ Đã tạo "${fullName}"`);
  await loadBankList();
});

// ── Delete Bank ──
async function deleteBank(bankName) {
  // Remove from localBankFiles
  const files = await getBankFiles();
  const updated = files.filter(f => f !== bankName);
  await saveBankFiles(updated);

  // Mark as initialized so default bundled bank won't re-appear
  await chrome.storage.sync.set({ bankFilesInitialized: true });

  // Always delete storage data (both bundled and custom)
  const banks = await getStorageBanks();
  delete banks[bankName];
  await saveStorageBanks(banks);

  showToast('statusBank', `🗑️ Đã xoá "${bankName}"`);
  await loadBankList();
}

// ═══════════════════════════════════════════
// EXCEL UPLOAD
// ═══════════════════════════════════════════

let _parsedExcelData = null;

const uploadZone = document.getElementById('uploadZone');
const excelFileInput = document.getElementById('excelFile');
const excelPreview = document.getElementById('excelPreview');
const excelImportBtn = document.getElementById('excelImportBtn');

// Click to open file dialog
uploadZone.addEventListener('click', () => excelFileInput.click());

// Drag & Drop
uploadZone.addEventListener('dragover', e => {
  e.preventDefault();
  uploadZone.classList.add('dragover');
});
uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('dragover');
});
uploadZone.addEventListener('drop', e => {
  e.preventDefault();
  uploadZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file) processExcelFile(file);
});

// File input change
excelFileInput.addEventListener('change', () => {
  const file = excelFileInput.files[0];
  if (file) processExcelFile(file);
});

function processExcelFile(file) {
  if (!file.name.match(/\.(xlsx|xls)$/i)) {
    showExcelPreview('❌ Chỉ hỗ trợ file .xlsx hoặc .xls', true);
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Read first sheet
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      if (rows.length < 2) {
        showExcelPreview('❌ File Excel trống hoặc chỉ có header', true);
        return;
      }

      // Parse rows (skip header row 0)
      const questions = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || !row[0]) continue; // skip empty rows

        const question = String(row[0] || '').trim();
        const optA = String(row[1] || '').trim();
        const optB = String(row[2] || '').trim();
        const optC = String(row[3] || '').trim();
        const optD = String(row[4] || '').trim();
        const answer = String(row[5] || '').trim().charAt(0).toUpperCase();
        const explanation = String(row[6] || '').trim();

        if (!question || !answer) continue;
        if (!['A', 'B', 'C', 'D'].includes(answer)) continue;

        questions.push({
          question,
          options: { A: optA, B: optB, C: optC, D: optD },
          answer,
          explanation
        });
      }

      if (!questions.length) {
        showExcelPreview('❌ Không tìm thấy câu hỏi hợp lệ trong file', true);
        _parsedExcelData = null;
        excelImportBtn.disabled = true;
        return;
      }

      _parsedExcelData = questions;
      showExcelPreview(`✅ Đã đọc ${questions.length} câu hỏi từ "${file.name}" (sheet: ${sheetName})`, false);
      excelImportBtn.disabled = false;

    } catch (err) {
      showExcelPreview(`❌ Lỗi đọc file: ${err.message}`, true);
      _parsedExcelData = null;
      excelImportBtn.disabled = true;
    }
  };
  reader.readAsArrayBuffer(file);
}

function showExcelPreview(text, isError) {
  excelPreview.style.display = 'block';
  excelPreview.textContent = text;
  excelPreview.classList.toggle('error', isError);
}

// Import button
excelImportBtn.addEventListener('click', async () => {
  const bankName = document.getElementById('targetBank').value;
  if (!bankName) return showToast('statusExcel', '❌ Chọn ngân hàng trước!', true);
  if (!_parsedExcelData || !_parsedExcelData.length) return;

  const banks = await getStorageBanks();
  if (!banks[bankName]) banks[bankName] = [];
  banks[bankName].push(..._parsedExcelData);
  await saveStorageBanks(banks);

  const count = _parsedExcelData.length;
  showToast('statusExcel', `✅ Đã import ${count} câu!`);
  
  // Reset
  _parsedExcelData = null;
  excelImportBtn.disabled = true;
  excelPreview.style.display = 'none';
  excelFileInput.value = '';
  
  await loadBankList();
});



// ═══════════════════════════════════════════
// EXCEL TEMPLATE DOWNLOAD
// ═══════════════════════════════════════════

document.getElementById('downloadTemplate').addEventListener('click', (e) => {
  e.preventDefault();
  downloadTemplate();
});

function downloadTemplate() {
  const data = [
    ['Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án', 'Giải thích'],
    ['Ngân hàng nào có tổng tài sản lớn nhất Việt Nam?', 'Vietcombank', 'Agribank', 'BIDV', 'Techcombank', 'B', 'Agribank có tổng tài sản lớn nhất hệ thống ngân hàng VN'],
    ['HTML là viết tắt của gì?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Không có đáp án đúng', 'A', 'HTML = Hyper Text Markup Language']
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);

  // Set column widths for readability
  ws['!cols'] = [
    { wch: 45 },  // Câu hỏi
    { wch: 30 },  // A
    { wch: 30 },  // B
    { wch: 30 },  // C
    { wch: 30 },  // D
    { wch: 10 },  // Đáp án
    { wch: 40 },  // Giải thích
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Mẫu');
  XLSX.writeFile(wb, 'mau-ngan-hang-cau-hoi.xlsx');
}

// ── Utilities ──
function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[m]));
}

function escapeAttr(s) {
  return (s || '').replace(/"/g, '&quot;');
}

// ── Init ──
loadBankList();
