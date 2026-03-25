# Popup UI Redesign

## What

Thiết kế lại giao diện popup extension với phong cách hiện đại, chuyên nghiệp. Ẩn 2 nút không cần thiết và áp dụng design system mới.

## Why

Giao diện hiện tại quá đơn giản, sử dụng emoji làm icon, không có style guide nhất quán. Cần nâng cấp để trông chuyên nghiệp hơn phù hợp với thương hiệu Agribank.

## Scope

### Thay đổi:
- **Ẩn nút**: `📸 Chụp ảnh` và `🔗 Mở dạng tab` (giữ JS handler, chỉ ẩn UI)
- **Thiết kế mới**: Nền trắng, màu chủ đạo `#AE1C3F` (đỏ Agribank)
- **Typography**: Inter font cho modern look  
- **Icons**: SVG icons thay cho emoji
- **Layout**: Card-based, bo tròn, shadow nhẹ
- **Interactions**: Hover effects, transitions mượt

### Không thay đổi:
- Logic JS (popup.js, content.js, background.js)
- Chức năng lấy dữ liệu, tìm đáp án  
- Trang options/settings

## Affected

- `popup.html` — Cấu trúc HTML + inline CSS → tách CSS riêng
- `popup.css` — [NEW] File CSS riêng cho design system
- `popup.js` — Chỉ xóa/comment event listeners cho 2 nút bị ẩn
