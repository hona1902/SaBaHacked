# Design — Settings Tabs & JSON Manager

## Architecture

### Tab System
- Pure CSS + JS tab switching (no framework)
- Tab buttons at top, content panels below
- Active tab state stored in `sessionStorage` (persist across re-renders)
- Matches existing brand color scheme (#AE1C3F)

### Tab 1: "Cài đặt chung"
- **No changes** to existing fields: `endpoint`, `apiKey`, `hostPatterns`
- Same Save button logic via `chrome.storage.sync`

### Tab 2: "Ngân hàng câu hỏi"
Two sections:

#### 2a. Quản lý file JSON
- List all registered bank files from `localBankFiles` in `chrome.storage.sync`
- Each file row: filename, question count, toggle active/inactive, delete button
- "Thêm file" button → text input for filename (auto-prefix `data/`, auto-suffix `.json`)
- Creating a new file → writes an empty `[]` array to `chrome.storage.local` as a virtual bank
  
> **Storage Strategy**: Since Chrome extension `web_accessible_resources` can only serve bundled files (not dynamically created), we store user-created question banks in `chrome.storage.local` keyed by filename. The `answer-bank.js` module will be updated to also check `chrome.storage.local` as a fallback.

#### 2b. Thêm câu hỏi
- Form: question text, 4 options (A/B/C/D), correct answer selector, explanation (optional)
- File selector (which bank to add to)
- Validate all fields → append to the selected bank in `chrome.storage.local`
- Show current question count per bank
- Import/Export: paste raw JSON array to bulk-import questions

### Data Flow

```
options.js ──save──▶ chrome.storage.sync (endpoint, apiKey, hostPatterns, localBankFiles)
options.js ──save──▶ chrome.storage.local (questionBanks: { "bank-name": [...questions] })
popup.js ──load──▶ answer-bank.js ──fetch──▶ data/*.json (bundled) 
                                   ──read──▶ chrome.storage.local (user-created banks)
```

### Files Changed

| File | Action |
|------|--------|
| `options.html` | Rewrite with tabbed layout, modern CSS |
| `options.js` | Rewrite with tab switching, bank CRUD, question form |
| `answer-bank.js` | Add `loadFromStorage()` to read `chrome.storage.local` banks |
