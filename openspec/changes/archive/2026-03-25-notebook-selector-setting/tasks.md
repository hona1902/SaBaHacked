# Tasks: Notebook Selector in Settings

## Task 1: Update `config.json` schema
- [x] Replace `"notebookId": "..."` with `"notebooks": [{ "id": "...", "name": "..." }]`
- [x] Keep `notebookApiUrl`, `notebookApiPassword`, `sessionMode` as-is

## Task 2: Add notebook combobox in `options.html`
- [x] Add a `<select id="notebookPicker">` field in the ChatBot section, before the Session Mode dropdown
- [x] Add label "Nghiệp vụ" with description "Chọn nghiệp vụ để gửi câu hỏi tới AI"

## Task 3: Populate and save notebook selection in `options.js`
- [x] On load: fetch `config.json`, read `notebooks` array (with fallback to old `notebookId` field)
- [x] Populate `#notebookPicker` with notebook names and IDs
- [x] Restore saved `selectedNotebookId` from `chrome.storage.sync`
- [x] On change: save `selectedNotebookId` to `chrome.storage.sync`
- [x] Include `selectedNotebookId` in the `saveGeneral` click handler

## Task 4: Use selected notebook in `popup.js`
- [x] Read `selectedNotebookId` from `chrome.storage.sync` when preparing to call AI
- [x] Build fallback chain: `selectedNotebookId` → `notebooks[0].id` → old `notebookId`
- [x] Pass the resolved notebook ID to `notebookChat()`
