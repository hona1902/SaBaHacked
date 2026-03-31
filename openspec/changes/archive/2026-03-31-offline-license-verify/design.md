## Context

Extension SabaHacked hiện dùng API remote (`POST /api/license/verify`) để xác thực license key. Điều này yêu cầu deploy server riêng, tạo dependency không cần thiết cho một extension nhỏ. Cần chuyển sang offline verify hoàn toàn tại client.

Hiện tại `license.js` đã có `generateFingerprint()` tạo SHA-256 từ navigator properties. Popup gate và Settings UI đã hoạt động — chỉ cần thay core verify logic.

## Goals / Non-Goals

**Goals:**
- Verify license key 100% offline — không cần server
- User thấy "Mã máy" ngắn gọn (8 ký tự) để gửi cho admin
- Admin có tool HTML standalone để sinh key từ mã máy
- Giữ nguyên UX hiện tại: popup badge, AI gate, settings activation

**Non-Goals:**
- Không làm expiration date (giữ đơn giản — key valid vĩnh viễn)
- Không chống crack/deobfuscate (đây là Chrome extension, source luôn visible)
- Không thay đổi popup gate logic (đã hoạt động tốt)

## Decisions

### 1. Thuật toán verify: HMAC-SHA256

**Chọn**: `HMAC-SHA256(machineCode, SECRET_KEY)` tạo license key
**Alternative**: Symmetric encryption (AES) — phức tạp hơn, không cần thiết

Lý do: HMAC đơn giản, không cần decrypt, chỉ cần so sánh. Web Crypto API hỗ trợ native, zero dependencies. Secret key nhúng trong extension (accepted trade-off vì Chrome extension source luôn visible).

### 2. Machine Code format: 8 ký tự uppercase

**Chọn**: 8 ký tự đầu của fingerprint SHA-256, uppercase
**Alternative**: Full hash — quá dài để user copy/gửi qua chat

Lý do: 8 hex chars = 4 billion combinations, đủ unique cho use case này. Dễ đọc, dễ gửi.

### 3. License Key format: 16 ký tự uppercase

**Chọn**: 16 ký tự đầu của HMAC result, uppercase
**Alternative**: Full HMAC — 64 chars quá dài

Lý do: 16 hex chars = 18 quintillion combinations, đủ an toàn. Dễ nhập.

### 4. Secret Key: embedded trong extension code

**Chọn**: Hardcode secret key trong `license.js`
**Lý do**: Chrome extension source luôn visible → không có cách nào thực sự giấu secret. Đủ tốt để ngăn user bình thường, admin tool dùng cùng secret.

### 5. Admin Tool: standalone HTML file

**Chọn**: File `keygen.html` riêng biệt, KHÔNG đóng gói trong extension
**Lý do**: Admin mở file trên máy mình, nhập mã máy → sinh key. Không cần server, không cần build.

## Risks / Trade-offs

- **Secret key visible trong source** → Chấp nhận. Extension source luôn visible. Mục đích là gate convenience, không phải DRM cứng.
- **Fingerprint có thể thay đổi** (update browser, thay độ phân giải) → User cần liên hệ admin lấy key mới. Accepted — hiếm xảy ra.
- **Không có expiration** → Nếu cần, có thể thêm sau bằng cách encode timestamp trong key.
