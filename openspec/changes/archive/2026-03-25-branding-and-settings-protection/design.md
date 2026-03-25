# Design: Branding & Settings Protection

## 1. Đổi tên hiển thị

Thay toàn bộ "Open Notebook AI" / "Open Notebook" trong giao diện user-facing:

| File | Vị trí | Cũ | Mới |
|---|---|---|---|
| `popup.js` | `renderNotebookResult()` | "📓 Open Notebook AI" | "🤖 ChatBot - HNA Soft" |
| `popup.js` | Loading message | "📓 Đang hỏi Open Notebook AI…" | "🤖 Đang hỏi ChatBot…" |
| `popup.js` | Error message | "❌ Open Notebook Error:" | "❌ ChatBot Error:" |
| `options.html` | Section title | "📓 Open Notebook (Hỏi AI)" | "🤖 ChatBot - HNA Soft" |
| `options.html` | Field help text | "Base URL của Open Notebook API" | (xoá cùng field) |

Code comments giữ nguyên — không ảnh hưởng UX.

## 2. Ẩn cài đặt API Notebook

**Cách tiếp cận**: Xoá 3 field (Notebook API URL, Notebook ID, Notebook API Password) khỏi `options.html`. Giá trị luôn đọc từ `config.json` được ship cùng extension.

### `options.html`
- Xoá toàn bộ 3 `<div class="field">` cho notebookApiUrl, notebookId, notebookApiPassword
- Giữ lại section title và dropdown sessionMode

### `options.js`
- Xoá code load/save 3 field này từ UI
- Luôn đọc từ `config.json` defaults (đã có logic này)
- Không lưu 3 field này vào `chrome.storage.sync` nữa

### `popup.js`
- Đọc notebookApiUrl, notebookId, notebookApiPassword từ `config.json` defaults thay vì storage
- Fallback: vẫn check `chrome.storage.sync` cho backward compatibility
