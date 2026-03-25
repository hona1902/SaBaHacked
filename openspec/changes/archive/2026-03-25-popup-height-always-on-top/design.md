# Design: Popup Height & Always-on-Top

## 1. Tăng chiều cao popup

### `background.js` — `chrome.windows.create()`
- `height: 600` → `height: 750`

### `popup.css` — body
- `min-height: 520px` → `min-height: 680px`

## 2. Always-on-top logic

### Approach: `chrome.windows.onFocusChanged` listener

Trong `background.js`:

1. Lưu `popupWindowId` khi tạo popup window
2. Lắng nghe `chrome.windows.onFocusChanged` — khi user focus vào window khác:
   - Kiểm tra popup window còn tồn tại không (`chrome.windows.get`)
   - Kiểm tra popup window có đang bị minimize (`state === 'minimized'`) không
   - Nếu còn tồn tại VÀ không minimize → gọi `chrome.windows.update(popupWindowId, { focused: true })` để đưa lên trên
3. Khi popup window bị đóng → dọn listener, reset `popupWindowId`
4. Khi popup window bị minimize → tạm dừng refocus cho đến khi user restore lại

### Edge cases
- Nếu popup đã mở, click icon lại → focus popup hiện có thay vì tạo mới
- Dùng `chrome.windows.onRemoved` để biết popup đã bị đóng
- Dùng debounce nhỏ (~100ms) tránh race condition focus loop
