(function(){
  const STYLE_ID = "__rag_assist_style__";
  const BADGE_CLASS = "__rag_assist_badge__";
  const HILITE_CLASS = "__rag_assist_highlight__";

  ensureStyle();

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg?.type === "GET_QUESTION_OPTIONS") {
      try {
        // Fast-path for Saba exam layout
        // Robust Saba detection: choose current question by radio input group nearest viewport center
        const visibleRadios = Array.from(document.querySelectorAll('input[type="radio"][id^="qrespb.\"][name^="qrespbn.\"]'))
          .filter(r => isVisible(r));
        if (visibleRadios.length) {
          const centerY = (window.scrollY || 0) + window.innerHeight / 2;
          // Group radios by name
          const nameToRadios = new Map();
          for (const r of visibleRadios) {
            const arr = nameToRadios.get(r.name) || [];
            arr.push(r); nameToRadios.set(r.name, arr);
          }
          let best = null; let bestDist = Infinity;
          for (const [name, arr] of nameToRadios.entries()) {
            arr.sort((a,b)=>a.getBoundingClientRect().top - b.getBoundingClientRect().top);
            const top = arr[0].getBoundingClientRect().top + window.scrollY;
            const dist = Math.abs(top - centerY);
            if (dist < bestDist) { bestDist = dist; best = { name, arr }; }
          }
          if (best) {
            const radios = best.arr.slice(0, 10);
            // Map to labels: first try for=id, then fallback to label inside same .scp-dbtncont container
            const optionsEls = radios.map(r => {
              let lbl = document.querySelector(`label[for="${CSS.escape(r.id)}"]`);
              if (!lbl) {
                // Fallback: find label inside the same .scp-dbtncont parent container
                const container = r.closest('.scp-dbtncont');
                if (container) lbl = container.querySelector('label');
              }
              return lbl;
            }).filter(Boolean);
            // ── Find question text for THIS radio group ──
            // Strategy: Walk UP from the first radio to find the enclosing 
            // question container, then get .scp-qtext WITHIN that container
            let qNode = null;
            const firstRadio = radios[0];

            // Method A: Walk up from radio to find ancestor containing .scp-qtext
            {
              let ancestor = firstRadio.closest('.scp-dbtncont')?.parentElement || firstRadio.parentElement;
              let depth = 0;
              while (ancestor && depth < 8) {
                const qTextInside = ancestor.querySelector('.scp-qtext');
                if (qTextInside && isVisible(qTextInside)) {
                  // Verify this container also contains OUR radios (not a different question)
                  const hasOurRadio = ancestor.contains(firstRadio);
                  if (hasOurRadio) {
                    qNode = qTextInside;
                    break;
                  }
                }
                ancestor = ancestor.parentElement;
                depth++;
              }
            }

            // Method B: Look for .scp-qtext that is a previous sibling of
            // one of the ancestors of the first .scp-dbtncont
            if (!qNode) {
              let el = firstRadio.closest('.scp-dbtncont');
              let depth = 0;
              while (el && depth < 6) {
                let prev = el.previousElementSibling;
                let hops = 0;
                while (prev && hops < 3) {
                  if (prev.classList?.contains('scp-qtext') && isVisible(prev)) {
                    qNode = prev; break;
                  }
                  const nested = prev.querySelector('.scp-qtext');
                  if (nested && isVisible(nested)) {
                    qNode = nested; break;
                  }
                  prev = prev.previousElementSibling;
                  hops++;
                }
                if (qNode) break;
                el = el.parentElement;
                depth++;
              }
            }

            // Method C (last resort): Pick the .scp-qtext with bottom closest 
            // to first radio's top, but ABOVE or overlapping
            if (!qNode) {
              const firstTop = firstRadio.getBoundingClientRect().top + window.scrollY;
              let bestDist = Infinity;
              document.querySelectorAll('.scp-qtext').forEach(q => {
                if (!isVisible(q)) return;
                const bottom = q.getBoundingClientRect().bottom + window.scrollY;
                const dist = firstTop - bottom;
                if (dist >= -20 && dist < bestDist) { bestDist = dist; qNode = q; }
              });
            }
            const question = rawText(qNode ? qNode.innerText : "");
            const options = optionsEls.map(el => ({ el }));
            if (options.length >= 2) {
              sendResponse({ question, options: options.map(b => mapOptionNode(b.el)) });
              return true;
            }
          }
        }

        const result = findQuestionWithOptions();
        if (result && result.options?.length) {
          sendResponse({
            question: result.question || "",
            options: result.options.map(b => mapOptionNode(b.el))
          });
        } else {
          const blocks = findOptionNodes();
          sendResponse({ question: "", options: blocks.map(b => mapOptionNode(b.el)) });
        }
      } catch(_){
        const blocks = findOptionNodes();
        sendResponse({ question: "", options: blocks.map(b => mapOptionNode(b.el)) });
      }
      return true;
    }
    if (msg?.type === "HILITE_INDEX") {
      clearBadges();
      const nodes = findOptionNodes();
      const idx = Math.max(0, Math.min((nodes.length||1)-1, Number(msg.index||0)));
      const target = nodes[idx];
      if (target) {
        addBadge(target.el, `✔`);
        target.el.classList.add(HILITE_CLASS);
        target.el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    if (msg?.type === "ANNOTATE_RANKING") {
      clearBadges();
      const ranking = msg.ranking || [];
      if (ranking.length) {
        annotateRanking(ranking);
      } else if (msg.answer) {
        // Local match: highlight by answer letter (A=0, B=1, C=2, D=3)
        const idx = msg.answer.charCodeAt(0) - 65; // 'A'=0, 'B'=1, etc.
        const nodes = findOptionNodes();
        if (idx >= 0 && idx < nodes.length) {
          const target = nodes[idx];
          addBadge(target.el, `✔ ${msg.answer}`);
          target.el.classList.add(HILITE_CLASS);
          target.el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
      return;
    }
  });

  function annotateRanking(ranking){
    if (!ranking.length) return;

    const nodes = findOptionNodes();
    ranking.forEach((r, idx) => {
      const target = pickMatch(nodes, r.option_text);
      if (!target) return;
      addBadge(target.el, `#${idx+1} • ${scoreStr(r.score)}`);
      if (idx === 0) {
        target.el.classList.add(HILITE_CLASS);
        target.el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    });
  }

  function pickMatch(nodes, text){
    const t = normText(text || "");
    if (!t) return null;
    let cand = nodes.find(n => normText(n.el.innerText || "") === t);
    if (cand) return cand;
    cand = nodes.find(n => normText(n.el.innerText || "").includes(t) || t.includes(normText(n.el.innerText || "")));
    return cand || null;
  }

  function findOptionNodes(){
    // ── Strategy 1: Scope by radio button group nearest viewport center ──
    const visibleRadios = Array.from(document.querySelectorAll('input[type="radio"][name^="qrespbn."]'))
      .filter(r => isVisible(r));

    if (visibleRadios.length >= 2) {
      const centerY = (window.scrollY || 0) + window.innerHeight / 2;
      // Group by name
      const nameToRadios = new Map();
      for (const r of visibleRadios) {
        const arr = nameToRadios.get(r.name) || [];
        arr.push(r); nameToRadios.set(r.name, arr);
      }
      // Find the group nearest viewport center
      let bestName = null; let bestDist = Infinity;
      for (const [name, arr] of nameToRadios.entries()) {
        const top = arr[0].getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(top - centerY);
        if (dist < bestDist) { bestDist = dist; bestName = name; }
      }
      if (bestName) {
        const groupRadios = nameToRadios.get(bestName);
        // Get labels only for THIS group's radios
        const labels = groupRadios.map(r => {
          let lbl = document.querySelector(`label[for="${CSS.escape(r.id)}"]`);
          if (!lbl) {
            const container = r.closest('.scp-dbtncont');
            if (container) lbl = container.querySelector('label');
          }
          return lbl;
        }).filter(Boolean);
        if (labels.length >= 2) {
          return labels.map(el => ({ el }));
        }
      }
    }

    // ── Strategy 2: Saba labels scoped by nearest container group ──
    const sabaLabels = Array.from(document.querySelectorAll('.scp-dbtncont label, .scp-dbtntxt label'))
      .filter(el => isVisible(el) && normText(el.innerText || "").length >= 1);
    if (sabaLabels.length >= 2) {
      // Group by parent container to avoid mixing questions
      const centerY = (window.scrollY || 0) + window.innerHeight / 2;
      const groups = new Map();
      for (const lbl of sabaLabels) {
        // Use the grandparent of .scp-dbtncont as the question block
        const dbtncont = lbl.closest('.scp-dbtncont') || lbl.closest('.scp-dbtntxt');
        const qBlock = dbtncont?.parentElement || dbtncont;
        if (!qBlock) continue;
        if (!groups.has(qBlock)) groups.set(qBlock, []);
        groups.get(qBlock).push(lbl);
      }
      // Pick the group nearest viewport center with 2-6 options
      let bestGroup = null; let bestDist = Infinity;
      for (const [block, labels] of groups.entries()) {
        if (labels.length < 2 || labels.length > 10) continue;
        const top = block.getBoundingClientRect().top + window.scrollY;
        const dist = Math.abs(top + block.getBoundingClientRect().height / 2 - centerY);
        if (dist < bestDist) { bestDist = dist; bestGroup = labels; }
      }
      if (bestGroup && bestGroup.length >= 2) {
        return bestGroup.map(el => ({ el }));
      }
      // Fallback: return all saba labels if grouping failed
      return sabaLabels.map(el => ({ el }));
    }

    // ── Strategy 3: Generic selectors (non-Saba pages) ──
    const selectors = [
      "label", "li", "button", "[role='radio']", "[role='option']",
      "input[type='radio']+label", "input[type='checkbox']+label",
      ".answer, .option, .choice, .alternative"
    ];
    const els = Array.from(document.querySelectorAll(selectors.join(",")))
      .filter(el => isVisible(el) && normText(el.innerText || "").length >= 1)
      .filter(el => !el.closest("header, nav, aside, footer, [role='navigation']"));
    return els.map(el => ({ el }));
  }

  function addBadge(targetEl, text){
    const badge = document.createElement("span");
    badge.className = BADGE_CLASS;
    badge.textContent = text;
    badge.style.position = "absolute";
    badge.style.right = "4px";
    badge.style.top = "4px";
    badge.style.padding = "2px 6px";
    badge.style.fontSize = "12px";
    badge.style.border = "1px solid #f0c040";
    badge.style.background = "rgba(255,235,59,0.9)";
    badge.style.borderRadius = "6px";
    badge.style.zIndex = "2147483647";

    const host = targetEl;
    const prevPos = window.getComputedStyle(host).position;
    if (prevPos === "static") host.style.position = "relative";
    host.appendChild(badge);
  }

  function clearBadges(){
    document.querySelectorAll("."+BADGE_CLASS).forEach(x => x.remove());
    document.querySelectorAll("."+HILITE_CLASS).forEach(x => x.classList.remove(HILITE_CLASS));
  }

  function ensureStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${HILITE_CLASS} {
        outline: 3px solid gold !important;
        outline-offset: 2px !important;
        background: rgba(255,235,59,0.12) !important;
      }
    `;
    document.documentElement.appendChild(style);
  }

  function normText(s){ return (s||"").replace(/\s+/g," ").trim().toLowerCase(); }
  function rawText(s){ return (s||"").replace(/\s+/g," ").trim(); }
  function scoreStr(x){ return (x==null) ? "?" : (Math.round(x*100)/100).toString(); }

  function cssPath(el) {
    if (!(el instanceof Element)) return "";
    const path = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += "#" + el.id;
        path.unshift(selector);
        break;
      } else {
        let sib = el, nth = 1;
        while (sib = sib.previousElementSibling) {
          if (sib.nodeName.toLowerCase() === selector) nth++;
        }
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      el = el.parentNode;
    }
    return path.join(" > ");
  }

  // Try to detect a question block with its immediate options
  function findQuestionWithOptions(){
    const optionNodes = findOptionNodes().map(x => x.el);
    if (!optionNodes.length) return null;

    // Group options by nearest small container that contains >= 2 options
    const groups = new Map(); // Element -> {container, options}
    for (const el of optionNodes) {
      const container = findOptionsContainer(el, optionNodes);
      if (!container) continue;
      if (!groups.has(container)) groups.set(container, { container, options: [] });
      groups.get(container).options.push(el);
    }

    // Rank groups: prefer those with 3-8 options and near viewport center
    const centerY = (window.scrollY || 0) + window.innerHeight / 2;
    const ranked = Array.from(groups.values())
      .filter(g => g.options.length >= 2 && g.options.length <= 10)
      .map(g => {
        const r = g.container.getBoundingClientRect();
        const mid = r.top + window.scrollY + r.height / 2;
        const dist = Math.abs(mid - centerY);
        return { ...g, dist };
      })
      .sort((a,b) => a.dist - b.dist || b.options.length - a.options.length);

    if (!ranked.length) return null;
    const best = ranked[0];

    // Determine question text: prioritize text that appears IMMEDIATELY BEFORE the options
    let qText = "";
    
    // Method 1: Look for question text inside the same container as options
    let insideQ = best.container.querySelector(".question, .question-text, .prompt, .stem, h1, h2, h3, h4, h5");
    // Saba exam specific question container
    if (!insideQ) {
      insideQ = document.querySelector(".scp-qtext");
    }
    if (insideQ) qText = rawText(insideQ.innerText || "");
    
    // Method 2: Find text that appears immediately before the first option
    if (!qText || qText.length < 6) {
      const firstOption = best.options[0];
      
      // Look for text nodes that appear before the first option
      const walker = document.createTreeWalker(
        best.container,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function(node) {
            // Only accept text nodes that are before the first option
            const range = document.createRange();
            range.setStartBefore(node);
            range.setEndBefore(firstOption);
            return range.toString().trim().length > 0 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      
      let textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        const text = node.textContent.trim();
        if (text && text.length > 10) {
          textNodes.push(text);
        }
      }
      
      if (textNodes.length > 0) {
        // Take the last (closest to options) text node
        qText = rawText(textNodes[textNodes.length - 1]);
      }
    }
    
    // Method 3: Look for immediate previous sibling that contains question-like text
    if (!qText || qText.length < 6) {
      let prev = best.container.previousElementSibling;
      let hops = 0;
      while (prev && hops < 2) { // Reduced to only 2 hops
        const text = rawText(prev.innerText || "");
        const textLower = text.toLowerCase();
        // Look for text that contains question indicators
        if (text && text.length >= 10 && 
            (textLower.includes('câu') || textLower.includes('?') || textLower.includes('là gì') || 
             textLower.includes('theo') || textLower.includes('quy định'))) {
          qText = text;
          break;
        }
        prev = prev.previousElementSibling; 
        hops++;
      }
    }
    
    // Method 4: Look for text within the container that's not part of options
    if (!qText || qText.length < 6) {
      const containerText = best.container.innerText || "";
      const optionsText = best.options.map(opt => opt.el.innerText).join(' ');
      
      // Remove options text from container text to get question
      let questionText = containerText;
      best.options.forEach(opt => {
        questionText = questionText.replace(opt.el.innerText, '');
      });
      
      questionText = rawText(questionText);
      if (questionText && questionText.length > 10) {
        qText = questionText;
      }
    }

    const options = best.options.map(el => ({ el }));
    return { question: qText, options };
  }

  function findOptionsContainer(el, allOptionEls){
    let cur = el.parentElement;
    let depth = 0;
    while (cur && depth < 6) {
      const count = allOptionEls.filter(n => cur.contains(n)).length;
      if (count >= 2) return cur;
      cur = cur.parentElement; depth++;
    }
    return el.parentElement || null;
  }

  function isVisible(el){
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }

  function mapOptionNode(el){
    const text = rawText(el.innerText || "");
    const img = el.querySelector('img');
    const imgInfo = img ? { src: img.src || "", alt: rawText(img.alt || "") } : null;
    return { text, path: cssPath(el), img: imgInfo };
  }
})();