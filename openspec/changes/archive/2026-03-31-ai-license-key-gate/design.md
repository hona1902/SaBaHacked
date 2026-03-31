## Context

SabaHacked là Chrome extension hỗ trợ thi trắc nghiệm cho nhân viên Agribank. Tính năng "Hỏi AI" gọi Notebook API (`sotay5491.io.vn/api`) để nhận câu trả lời. Hiện tại không có cơ chế kiểm soát quyền — ai cài extension đều dùng AI được, dẫn đến chi phí API không kiểm soát.

Extension hiện lưu cấu hình API trong `config.json` (bundled), settings người dùng trong `chrome.storage.sync`, và session info trong `chrome.storage.local`.

## Goals / Non-Goals

**Goals:**
- Gate tính năng "Hỏi AI" bằng license key duy nhất theo máy
- UI nhập key trong Settings + hiển thị trạng thái license trên popup
- Xác thực key qua API server, cache kết quả để tránh gọi API mỗi lần
- Trải nghiệm mượt: người dùng nhập key 1 lần, sau đó dùng bình thường

**Non-Goals:**
- Không xây dựng hệ thống quản lý license phía server (giả sử server đã có endpoint)
- Không mã hóa hay obfuscate code client (extension source luôn visible)
- Không gate các tính năng khác (local matching, capture, pull from page)

## Decisions

### 1. Machine Fingerprint
**Quyết định**: Sử dụng hash từ `navigator.userAgent + navigator.language + screen dimensions + timezone` để tạo fingerprint máy.

**Lý do**: Không cần cài thêm thư viện, đủ unique cho mục đích license binding. Không dùng FingerprintJS vì thêm dependency nặng.

**Phương án khác**: Canvas fingerprint (phức tạp hơn, dễ bị anti-fingerprint extension chặn).

### 2. Verify API Flow
**Quyết định**: Gọi `POST /api/license/verify` gửi `{ key, fingerprint }`, server trả `{ valid: boolean, expiresAt?: string }`.

**Lý do**: Đơn giản, dễ implement, server kiểm soát logic. Cùng base URL với Notebook API (`config.json > notebookApiUrl`).

### 3. Cache Strategy
**Quyết định**: Cache kết quả verify vào `chrome.storage.local` với TTL 24 giờ. Key cache: `licenseCache`.

**Lý do**: Giảm load server, người dùng không phải chờ verify mỗi lần bấm "Hỏi AI". 24h đủ để server có thể revoke key trong ngày.

### 4. UI Integration
**Quyết định**: 
- **Settings** (options.html): Thêm section "Bản quyền" với ô nhập key + nút "Kích hoạt" + trạng thái
- **Popup** (popup.html): Hiển thị badge trạng thái nhỏ gọn, nếu chưa kích hoạt thì disable nút "Hỏi AI" và hiện thông báo yêu cầu nhập key

## Risks / Trade-offs

- **Client-side bypass**: Ai biết code có thể bỏ qua check → Mitigation: verify server-side, key chỉ valid với fingerprint cụ thể
- **Fingerprint thay đổi**: User update browser/OS có thể đổi fingerprint → Mitigation: Admin có thể reset binding trên server
- **Cache stale**: Key bị revoke nhưng cache chưa hết hạn → Mitigation: TTL 24h là acceptable, có thể force re-verify khi mở Settings
- **Offline**: Không có mạng thì không verify được → Mitigation: Dùng cached result, nếu cache hết hạn + offline thì block (acceptable vì AI cũng cần mạng)
