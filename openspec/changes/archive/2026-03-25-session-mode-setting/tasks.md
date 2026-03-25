# Tasks: Session Mode Setting

## Task 1: Thêm UI setting vào `options.html`
- [x] Thêm dropdown `sessionMode` trong section "Open Notebook"
- [x] 2 lựa chọn: "Dùng 1 session" (`reuse`) / "Mỗi câu hỏi tạo session mới" (`new`)
- Files: `options.html`

## Task 2: Load/Save setting trong `options.js`
- [x] Load `sessionMode` từ `chrome.storage.sync` khi mở Settings
- [x] Save `sessionMode` khi nhấn "Lưu cài đặt"
- Files: `options.js`

## Task 3: Cập nhật `config.json`
- [x] Thêm `"sessionMode": "reuse"` làm giá trị mặc định
- Files: `config.json`

## Task 4: Cập nhật `notebookChat()` trong `popup.js`
- [x] Đọc `sessionMode` từ config
- [x] Khi `reuse`: kiểm tra và tái sử dụng session từ `chrome.storage.local`
- [x] Khi `new`: giữ hành vi cũ
- [x] Thêm error handling: nếu session cũ lỗi → tạo mới tự động
- Files: `popup.js`
