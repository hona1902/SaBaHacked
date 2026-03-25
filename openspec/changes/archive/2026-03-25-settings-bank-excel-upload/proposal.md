# Settings Bank Manager: Excel Upload & Delete

## What

Cải thiện Tab 2 (Ngân hàng câu hỏi) trong Settings:

1. **Thêm nút xoá** cho từng file JSON (bundled lẫn custom) — hiện tại nút xoá đã có cho custom bank nhưng UI chưa rõ ràng, cần bổ sung khả năng xoá bundled bank khỏi danh sách active.
2. **Thêm chức năng upload Excel** (.xlsx) → tự động chuyển thành JSON question bank.
3. **Bỏ form thêm câu hỏi thủ công** (phần Add Question với 4 ô input A/B/C/D).

## Why

- Người dùng cần upload ngân hàng câu hỏi từ file Excel có sẵn, nhập thủ công từng câu rất mất thời gian.
- File Excel thường có cấu trúc: cột câu hỏi, cột A, B, C, D, cột đáp án, cách này phổ biến hơn nhập JSON thủ công.
- Nút xoá bundled bank cần thiết để bỏ bớt bank không dùng, giảm thời gian matching.

## Scope

- **options.html** — Xoá phần "Thêm câu hỏi" form, thêm khu vực upload Excel
- **options.js** — Logic đọc Excel bằng SheetJS (xlsx), chuyển thành JSON, lưu vào storage; logic xoá bank
- **manifest.json** — Cân nhắc thêm SheetJS library nếu cần

## Dependencies

- **SheetJS (xlsx)** — thư viện đọc file Excel trong browser, CDN hoặc bundle local
