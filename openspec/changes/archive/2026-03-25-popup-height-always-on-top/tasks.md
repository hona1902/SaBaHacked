# Tasks: Popup Height & Always-on-Top

- [x] **Task 1: Tăng chiều cao popup**
  - `background.js`: đổi `height: 600` → `height: 750`
  - `popup.css`: đổi `min-height: 520px` → `min-height: 680px`

- [x] **Task 2: Implement always-on-top trong `background.js`**
  - Lưu `popupWindowId` khi tạo popup
  - Nếu popup đã mở, click icon → focus popup hiện có thay vì tạo mới
  - Thêm `chrome.windows.onFocusChanged` listener để refocus popup
  - Bỏ qua refocus khi popup bị minimize
  - Cleanup listener khi popup bị đóng (`chrome.windows.onRemoved`)
  - Thêm debounce 100ms tránh focus loop
