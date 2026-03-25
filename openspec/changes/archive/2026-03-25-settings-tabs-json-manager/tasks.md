# Tasks — Settings Tabs & JSON Manager

## Implementation

- [ ] **Task 1**: Rewrite `options.html` — tabbed layout with modern CSS
  - Tab bar: "Cài đặt chung" | "Ngân hàng câu hỏi"
  - Tab 1 content: existing fields (endpoint, apiKey, hostPatterns) + Save button
  - Tab 2 content: bank list, create bank form, add question form, import JSON area
  - Brand-consistent styling with Inter font, #AE1C3F accents

- [ ] **Task 2**: Rewrite `options.js` — tab switching + bank CRUD + question form
  - Tab switching with `sessionStorage` persistence
  - General settings: load/save from `chrome.storage.sync` (existing logic preserved)
  - Bank management: list/create/delete banks in `chrome.storage.local`
  - Question CRUD: add single question, bulk import JSON, count display
  - `localBankFiles` management: auto-update list when banks are created/deleted

- [ ] **Task 3**: Update `answer-bank.js` — add `chrome.storage.local` fallback
  - In `loadAnswerBank()`, after trying `fetch(chrome.runtime.getURL(path))`:
    - If fetch fails, try `chrome.storage.local.get('questionBanks')` → read bank by name
  - Merge bundled + storage banks into single array

- [ ] **Task 4**: Manual verification
  - Reload extension → open Settings → verify 2 tabs display correctly
  - Tab 1: existing fields populate and save correctly
  - Tab 2: create new bank → add questions → verify count updates
  - Tab 2: delete bank → confirm removed from list
  - Return to popup → "Tìm đáp án" → verify storage-based banks are matched
