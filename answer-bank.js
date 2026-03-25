/**
 * answer-bank.js — Local Question Bank Matching Module
 * 
 * Load JSON question banks bundled with the extension,
 * match questions using text similarity, and map answers
 * accounting for shuffled ABCD order.
 */

const AnswerBank = (() => {
  // ── Config ──
  const QUESTION_MATCH_THRESHOLD = 0.65;
  const OPTION_MAP_THRESHOLD = 0.55;

  // ── Cache ──
  let _bankCache = null;
  let _bankPaths = null;

  // ── Text Normalization ──
  function normalize(text) {
    if (!text) return '';
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // strip diacritics (Vietnamese)
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ') // keep only letters, numbers, spaces
      .replace(/\s+/g, ' ')
      .trim();
  }

  // ── Jaccard Word Similarity ──
  function jaccardSimilarity(a, b) {
    const wordsA = new Set(normalize(a).split(' ').filter(w => w.length > 0));
    const wordsB = new Set(normalize(b).split(' ').filter(w => w.length > 0));
    if (!wordsA.size || !wordsB.size) return 0;
    let intersection = 0;
    for (const w of wordsA) {
      if (wordsB.has(w)) intersection++;
    }
    return intersection / (wordsA.size + wordsB.size - intersection);
  }

  // ── Multi-tier Text Similarity ──
  function textSimilarity(a, b) {
    const na = normalize(a);
    const nb = normalize(b);
    if (!na || !nb) return 0;

    // Stage 1: Exact match
    if (na === nb) return 1.0;

    // Stage 2: Substring containment
    if (na.includes(nb) || nb.includes(na)) return 0.95;

    // Stage 3: Jaccard similarity
    return jaccardSimilarity(a, b);
  }

  // ── Load Question Bank ──
  async function loadAnswerBank(filePaths) {
    // Invalidate cache each time to pick up new questions from storage
    const bank = [];

    // 1. Load from chrome.storage.local first (user-created banks)
    let storageBanks = {};
    try {
      const result = await chrome.storage.local.get({ questionBanks: {} });
      storageBanks = result.questionBanks || {};
      console.log('[AnswerBank] Storage keys:', Object.keys(storageBanks));
    } catch (e) {
      console.warn('[AnswerBank] Failed to read storage:', e);
    }

    // 2. For each path: use storage if available, otherwise try fetch (bundled files)
    for (const path of filePaths) {
      if (storageBanks[path] && Array.isArray(storageBanks[path])) {
        // Found in storage — no need to fetch
        console.log(`[AnswerBank] ✅ Loaded ${storageBanks[path].length} questions from storage for "${path}"`);
        bank.push(...storageBanks[path]);
      } else {
        // Not in storage — try as bundled file
        try {
          const url = chrome.runtime.getURL(path);
          const resp = await fetch(url);
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const data = await resp.json();
          if (Array.isArray(data)) {
            console.log(`[AnswerBank] ✅ Loaded ${data.length} questions from bundled file "${path}"`);
            bank.push(...data);
          }
        } catch (e) {
          console.warn(`[AnswerBank] ⚠️ "${path}" not found in storage or as bundled file`);
        }
      }
    }

    console.log(`[AnswerBank] Total bank: ${bank.length} questions`);
    _bankCache = bank;
    _bankPaths = [...filePaths];
    return bank;
  }

  // ── Find Local Answer ──
  function findLocalAnswer(question, pageOptions, bank) {
    if (!question || !bank || !bank.length) {
      console.log(`[AnswerBank] findLocalAnswer skipped — question: ${!!question}, bank: ${bank?.length || 0} entries`);
      return null;
    }

    console.log(`[AnswerBank] Searching for: "${question.substring(0, 80)}..." in ${bank.length} entries`);
    console.log(`[AnswerBank] 🔍 pageOptions received:`, JSON.stringify(pageOptions), `(length: ${(pageOptions||[]).length})`);

    // 1. Collect ALL matches above threshold
    const allMatches = [];
    for (const entry of bank) {
      const score = textSimilarity(question, entry.question);
      if (score >= QUESTION_MATCH_THRESHOLD) {
        const ansLetter = (entry.answer || '').trim().charAt(0).toUpperCase();
        const ansText = entry.options?.[ansLetter] || '';
        allMatches.push({
          entry,
          score,
          answerLetter: ansLetter,
          answerText: ansText
        });
      }
    }

    // Sort by score descending
    allMatches.sort((a, b) => b.score - a.score);

    console.log(`[AnswerBank] Found ${allMatches.length} matches above threshold ${QUESTION_MATCH_THRESHOLD}`);
    if (!allMatches.length) return null;

    // 2. Build allMatches list (lightweight info for display)
    const matchList = allMatches.map(m => ({
      question: m.entry.question,
      questionScore: m.score,
      answerLetter: m.answerLetter,
      answerText: m.answerText,
      options: m.entry.options || {},
      explanation: m.entry.explanation || ''
    }));

    // 3. Full option mapping only for the BEST match (top-1)
    const best = allMatches[0];
    const bestEntry = best.entry;
    const answerLetter = best.answerLetter;
    const answerText = best.answerText;

    console.log(`[AnswerBank] Best match score: ${best.score.toFixed(3)}, question: "${bestEntry.question?.substring(0, 80)}..."`);
    console.log(`[AnswerBank] Answer letter: "${answerLetter}", answerText: "${answerText}"`);

    if (!answerText) {
      console.log('[AnswerBank] ❌ answerText is empty — cannot map. Options:', JSON.stringify(bestEntry.options));
      return {
        matchedQuestion: bestEntry.question,
        questionScore: best.score,
        originalAnswer: answerLetter,
        originalAnswerText: '',
        mappedAnswer: answerLetter,
        mappedAnswerText: '',
        optionMappingScore: 0,
        explanation: bestEntry.explanation || '',
        bankOptions: bestEntry.options,
        pageOptions: [],
        allMatches: matchList
      };
    }

    // 4. Map answer to page option order (handle shuffled ABCD)
    const letters = ['A', 'B', 'C', 'D', 'E', 'F'];

    const cleanPageOpts = (pageOptions || []).map(o => 
      (o || '').toString().trim().replace(/^[A-Da-d][).\\:\s]\s*/, '')
    );

    console.log('[AnswerBank] 🔍 cleanPageOpts:', JSON.stringify(cleanPageOpts), `(length: ${cleanPageOpts.length})`);

    let mappedIdx = -1;
    let mappedScore = 0;

    if (cleanPageOpts.length && bestEntry.options) {
      const bankLetters = Object.keys(bestEntry.options).filter(k => /^[A-F]$/i.test(k));
      
      console.log('[AnswerBank] ✅ Entering mapping block');
      console.log('[AnswerBank] Bank letters:', bankLetters);
      console.log('[AnswerBank] Page options:', cleanPageOpts);
      console.log('[AnswerBank] Bank options:', bestEntry.options);

      // ── Greedy 1:1 bipartite matching ──
      // Build full similarity matrix and flatten into scored pairs
      const scoredPairs = [];
      for (const bl of bankLetters) {
        const bankText = bestEntry.options[bl] || '';
        if (!bankText) continue;
        for (let j = 0; j < cleanPageOpts.length; j++) {
          const s = textSimilarity(bankText, cleanPageOpts[j]);
          scoredPairs.push({ bankLetter: bl.toUpperCase(), pageIdx: j, score: s });
          console.log(`[AnswerBank]   similarity("${bankText.substring(0,30)}", "${cleanPageOpts[j].substring(0,30)}") = ${s.toFixed(3)}`);
        }
      }

      // Sort descending by score — highest similarity pairs first
      scoredPairs.sort((a, b) => b.score - a.score);

      console.log('[AnswerBank] Top scored pairs:', scoredPairs.slice(0, 8).map(p => 
        `${p.bankLetter}→Page[${p.pageIdx}]=${p.score.toFixed(2)}`
      ).join(', '));

      // Greedily assign: each bank letter → unique page index
      const bankToPage = {};
      const usedBank = new Set();
      const usedPage = new Set();
      for (const pair of scoredPairs) {
        if (usedBank.has(pair.bankLetter) || usedPage.has(pair.pageIdx)) continue;
        if (pair.score < OPTION_MAP_THRESHOLD) continue;
        bankToPage[pair.bankLetter] = { pageIdx: pair.pageIdx, score: pair.score };
        usedBank.add(pair.bankLetter);
        usedPage.add(pair.pageIdx);
        console.log(`[AnswerBank] ✅ Mapped: Bank ${pair.bankLetter}="${bestEntry.options[pair.bankLetter]}" → Page[${pair.pageIdx}]="${cleanPageOpts[pair.pageIdx]||'?'}" (score=${pair.score.toFixed(2)})`);
      }

      console.log('[AnswerBank] Final bankToPage:', JSON.stringify(bankToPage));
      console.log('[AnswerBank] Looking up answerLetter:', answerLetter);

      const mapping = bankToPage[answerLetter];
      if (mapping && mapping.pageIdx >= 0) {
        mappedIdx = mapping.pageIdx;
        mappedScore = mapping.score;
      }
      console.log('[AnswerBank] Final mapped answer:', letters[mappedIdx] || answerLetter, '(mappedIdx='+mappedIdx+', score='+mappedScore.toFixed(2)+')');
    } else {
      console.log('[AnswerBank] ❌ SKIPPED mapping block! cleanPageOpts.length:', cleanPageOpts.length, 'bestEntry.options:', !!bestEntry.options);
    }

    const isOptionMapped = mappedIdx >= 0;
    const mappedAnswer = isOptionMapped ? letters[mappedIdx] : answerLetter;
    const mappedAnswerText = isOptionMapped ? cleanPageOpts[mappedIdx] : answerText;

    console.log(`[AnswerBank] 🏁 RESULT: originalAnswer=${answerLetter}, mappedAnswer=${mappedAnswer}, isOptionMapped=${isOptionMapped}`);

    return {
      matchedQuestion: bestEntry.question,
      questionScore: best.score,
      originalAnswer: answerLetter,
      originalAnswerText: answerText,
      mappedAnswer,
      mappedAnswerText,
      optionMappingScore: mappedScore,
      explanation: bestEntry.explanation || '',
      bankOptions: bestEntry.options,
      pageOptions: cleanPageOpts,
      allMatches: matchList
    };
  }

  // ── Clear Cache ──
  function clearCache() {
    _bankCache = null;
    _bankPaths = null;
  }

  // ── Public API ──
  return {
    loadAnswerBank,
    findLocalAnswer,
    clearCache,
    // Exported for testing
    normalize,
    jaccardSimilarity,
    textSimilarity,
    QUESTION_MATCH_THRESHOLD,
    OPTION_MAP_THRESHOLD
  };
})();
