## Why

Tính năng "Hỏi AI" hiện tại có thể được sử dụng tự do bởi bất kỳ ai cài đặt extension, gây ra chi phí API không kiểm soát và không có cơ chế phân quyền. Cần thêm cơ chế bản quyền theo máy (machine-specific license key) để chỉ người dùng được cấp phép mới sử dụng được tính năng AI.

## What Changes

- Thêm ô nhập **License Key** trong trang Settings (tab Cài đặt chung)
- Key được lưu vào `chrome.storage.sync` và kiểm tra mỗi khi người dùng bấm "Hỏi AI"
- Xác thực key bằng cách gọi API endpoint trên server (`/api/license/verify`) gửi kèm key + fingerprint máy (hardware fingerprint sinh từ `navigator` properties)
- Nếu key không hợp lệ hoặc chưa nhập → hiện thông báo lỗi, không cho gọi AI
- Nếu key hợp lệ → cho phép gọi Notebook API bình thường
- Thêm trạng thái hiển thị license (✅ Đã kích hoạt / ❌ Chưa kích hoạt) trên popup

## Capabilities

### New Capabilities
- `license-verification`: Xác thực license key theo máy — bao gồm UI nhập key, sinh fingerprint, gọi API verify, cache kết quả, và gate tính năng AI

### Modified Capabilities

## Impact

- **popup.js**: Thêm logic kiểm tra license trước khi gọi `notebookChat()`, hiển thị trạng thái license
- **options.html / options.js**: Thêm ô nhập license key, nút kích hoạt, hiển thị trạng thái
- **background.js**: Có thể cần thêm listener xử lý verify license
- **config.json**: Thêm endpoint verify license (nếu khác API chính)
- **API Server**: Cần endpoint `/api/license/verify` nhận `{ key, fingerprint }` trả về `{ valid: true/false }`
