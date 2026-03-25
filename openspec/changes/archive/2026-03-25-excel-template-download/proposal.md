# Excel Template Download

## What
Thêm nút "📥 Tải file mẫu Excel" trong card Upload Excel trên Tab 2 Settings. Khi nhấn, tự động tạo và tải xuống file `.xlsx` mẫu với đúng format mà hệ thống yêu cầu.

## Why
Người dùng cần biết chính xác format Excel cần nhập. Thay vì đọc text hướng dẫn, tải file mẫu trực tiếp sẽ nhanh hơn và ít lỗi hơn.

## Scope
- **options.html** — Thêm nút tải mẫu
- **options.js** — Logic tạo file Excel mẫu bằng SheetJS (XLSX.utils) và trigger download
