# Design: Session Mode Setting

## Tổng quan

Thêm setting `sessionMode` với 2 giá trị:
- `"new"` (mặc định) — mỗi câu hỏi tạo session mới (hành vi hiện tại)
- `"reuse"` — tái sử dụng 1 session duy nhất

## Thay đổi theo file

### `options.html`
- Thêm dropdown/radio trong section "Open Notebook" cho phép chọn:
  - "Mỗi câu hỏi tạo session mới" (`new`)
  - "Dùng 1 session cho tất cả câu hỏi" (`reuse`)

### `options.js`
- Load/save giá trị `sessionMode` cùng các setting Notebook khác vào `chrome.storage.sync`

### `popup.js`
- Đọc `sessionMode` từ `chrome.storage.sync`
- Khi `sessionMode === "reuse"`:
  - Kiểm tra `chrome.storage.local` có `currentSessionId` và `currentSessionNotebookId` không
  - Nếu có và `currentSessionNotebookId === notebookId` → bỏ qua bước tạo session, dùng lại session đã lưu
  - Nếu không có hoặc notebook khác → tạo session mới, lưu lại vào `chrome.storage.local`
- Khi `sessionMode === "new"` (mặc định): giữ nguyên hành vi hiện tại — luôn tạo session mới
- Thêm xử lý lỗi: nếu session cũ bị lỗi (HTTP 4xx/5xx khi chat), tự động tạo session mới

### `config.json`
- Thêm `"sessionMode": "new"` làm giá trị mặc định

## Luồng xử lý

```
User nhấn "Hỏi AI"
  → Đọc sessionMode từ storage
  → if sessionMode === "reuse":
       → Đọc currentSessionId từ local storage
       → if có session hợp lệ → dùng lại
       → else → tạo mới, lưu lại
    else:
       → Tạo session mới (hành vi cũ)
  → Build context
  → Execute chat (nếu lỗi + reuse → retry với session mới)
```
