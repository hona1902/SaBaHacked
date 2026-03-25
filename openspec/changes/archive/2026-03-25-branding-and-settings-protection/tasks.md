# Tasks: Branding & Settings Protection

## Task 1: Đổi tên "Open Notebook AI" → "ChatBot - HNA Soft" trong `popup.js`
- Thay label trong `renderNotebookResult()`, loading message, error message
- Files: `popup.js`

## Task 2: Đổi tên section trong `options.html`
- Thay "📓 Open Notebook (Hỏi AI)" → "🤖 ChatBot - HNA Soft"
- Files: `options.html`

## Task 3: Ẩn 3 field API khỏi `options.html`
- Xoá field Notebook API URL, Notebook ID, Notebook API Password
- Giữ section title + dropdown sessionMode
- Files: `options.html`

## Task 4: Cập nhật `options.js` — bỏ load/save 3 field API
- Xoá code set value cho 3 input đã bị xoá
- Xoá 3 field khỏi `chrome.storage.sync.set()`
- Giữ đọc defaults từ `config.json` cho popup.js dùng
- Files: `options.js`
