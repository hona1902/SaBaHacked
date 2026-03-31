## Why

Hệ thống verify license hiện tại yêu cầu server API (`POST /api/license/verify`), tạo dependency lớn và không khả thi khi chưa deploy server. Cần chuyển sang verify hoàn toàn tại máy người dùng (offline) bằng cách sử dụng HMAC-SHA256 để ký mã máy thành license key, không cần kết nối mạng.

## What Changes

- **BREAKING**: Loại bỏ API verify (`verifyLicense` remote call) trong `license.js`
- Thay bằng offline verify: so sánh `HMAC-SHA256(machineCode, secret)` tại client
- Hiện "Mã máy" (8 ký tự đầu của fingerprint) cho người dùng copy gửi cho admin
- Tạo file `keygen.html` — tool standalone cho admin nhập mã máy → sinh license key
- Cập nhật Settings UI: hiện mã máy + ô nhập key + nút kích hoạt
- Cập nhật popup gate: giữ nguyên logic gate nhưng dùng offline verify

## Capabilities

### New Capabilities
- `offline-verify`: Xác thực license key hoàn toàn offline bằng HMAC-SHA256, hiện mã máy cho user
- `admin-keygen`: File HTML standalone cho admin sinh license key từ mã máy

### Modified Capabilities
_(none)_

## Impact

- `license.js` — rewrite verify logic (HMAC thay API call), bỏ cache TTL (offline = luôn verify được)
- `options.html` / `options.js` — hiện "Mã máy", giữ ô nhập key
- `popup.js` — không thay đổi logic gate, chỉ hưởng lợi từ `checkLicense()` offline
- **New**: `keygen.html` — file HTML riêng cho admin, KHÔNG đóng gói trong extension
