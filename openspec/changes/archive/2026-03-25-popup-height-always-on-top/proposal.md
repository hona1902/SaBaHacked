# Tăng chiều cao popup & luôn hiển thị trên cùng

## What

1. **Tăng chiều cao popup** khi mở từ 600px lên 750px
2. **Giữ popup luôn ở trên cùng** (always-on-top) trừ khi người dùng minimize

## Why

Popup hiện tại 600px khá nhỏ khi hiển thị kết quả dài (câu hỏi + options + all matches). Khi chuyển sang tab khác để đọc câu hỏi, popup bị mất focus và ẩn sau cửa sổ trình duyệt, buộc người dùng phải alt-tab để quay lại.

## Scope

- `background.js` — thay đổi kích thước cửa sổ và thêm logic always-on-top
- `popup.css` — tăng `min-height` tương ứng

## Technical Constraint

Chrome API không có `alwaysOnTop` cho extension windows. Giải pháp: dùng `chrome.windows.onFocusChanged` listener để tự động refocus popup window khi user chuyển focus, kèm logic tắt khi minimize.
