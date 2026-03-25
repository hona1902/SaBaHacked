# Session Mode Setting

## What

Thêm tuỳ chọn trong Settings cho phép chọn chế độ session khi hỏi AI:

- **Mỗi câu hỏi 1 session** (hiện tại) — mỗi lần gọi AI tạo session mới
- **Dùng 1 session** — tái sử dụng session duy nhất, chỉ tạo mới khi chưa có hoặc khi user reset
- **mặc định khi mở tiện ích là Dùng 1 session** — luôn mặc định khi dùng tiện ích là dùng 1 session cho đến khi, trừ khi user thay đổi

## Affected Areas

- `popup.js` — hàm `notebookChat()` hiện luôn tạo session mới
- `options.html` / `options.js` — thêm UI chọn chế độ session
- `chrome.storage.sync` — lưu setting `sessionMode`
- `chrome.storage.local` — lưu `currentSessionId` để tái sử dụng

## Why

Tiện ích chạy trên nhiều máy cùng lúc. Khi mode "mỗi câu 1 session", mỗi câu hỏi tạo session mới, gây ra nhiều session rác trên server. Với mode "1 session", mỗi máy chỉ dùng 1 session duy nhất, giảm tải server và giữ context hội thoại liên tục.
