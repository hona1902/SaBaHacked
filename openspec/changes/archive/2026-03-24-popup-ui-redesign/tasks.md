# Tasks: Popup UI Redesign

## Phase 1: CSS Design System
- [ ] T1: Tạo `popup.css` với CSS variables, typography, layout utilities
- [ ] T2: Style header bar (`.header`), buttons (`.btn-primary`, `.btn-outline`, `.btn-icon`)
- [ ] T3: Style selectors, textarea, results area, warning footer

## Phase 2: HTML Restructure
- [ ] T4: Cập nhật `popup.html` — thêm link CSS, thay emoji bằng SVG icons
- [ ] T5: Ẩn 2 nút (`captureScreen`, `openAsTabInline`) — xóa khỏi HTML hoặc `display:none`
- [ ] T6: Thêm header bar structure, wrap content trong card containers

## Phase 3: JS Cleanup
- [ ] T7: Xóa/comment event listeners cho 2 nút đã ẩn trong `popup.js`

## Phase 4: Verification
- [ ] T8: Reload extension, kiểm tra giao diện mới
- [ ] T9: Test chức năng lấy dữ liệu + tìm đáp án vẫn hoạt động
