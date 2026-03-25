# Design: Nút Clear

## Thay đổi

### popup.html
- Thêm `<button id="clearAll">` vào `.btn-row` (sau nút "Hỏi AI")
- Icon: SVG eraser/trash — dùng icon X-circle cho gọn
- Class: `btn btn-clear`

### popup.css
- Thêm style `.btn-clear`: nền xám nhạt, hover đỏ nhạt, icon nhỏ gọn
- Đặt ở cuối hàng button

### popup.js
- Listener `#clearAll` click:
  - Xóa `#question` textarea value → `""`
  - Xóa `#results` innerHTML → `""`
  - Focus lại textarea
