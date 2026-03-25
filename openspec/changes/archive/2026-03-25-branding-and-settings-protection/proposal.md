# Branding & Settings Protection

## What

1. **Đổi tên hiển thị**: Thay tất cả "Open Notebook AI" thành "ChatBot - HNA Soft" trong giao diện
2. **Ẩn cài đặt API**: Ẩn các field Notebook API URL, Notebook ID, Notebook API Password khỏi trang Settings — chỉ developer (người sở hữu source) mới chỉnh sửa được qua `config.json`

## Affected Areas

- `popup.js` — hiển thị tên AI khi trả lời, loading, lỗi
- `options.html` — ẩn 3 field Notebook API
- `options.js` — đọc trực tiếp từ `config.json`, không cho user override

## Why

- Branding: thể hiện thương hiệu HNA Soft thay vì tiết lộ backend
- Bảo mật: không để người dùng cuối thấy hoặc sửa API credentials
