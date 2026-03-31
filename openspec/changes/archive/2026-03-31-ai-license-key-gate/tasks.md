## 1. Fingerprint & License Utilities

- [x] 1.1 Tạo file `license.js` chứa hàm `generateFingerprint()` — sinh hash từ navigator properties (userAgent, language, screen, timezone) bằng SHA-256 (Web Crypto API)
- [x] 1.2 Thêm hàm `verifyLicense(key, baseUrl)` trong `license.js` — gọi `POST {baseUrl}/api/license/verify` gửi `{ key, fingerprint }`, trả về `{ valid, expiresAt }`
- [x] 1.3 Thêm hàm `checkLicenseCache()` trong `license.js` — đọc cache từ `chrome.storage.local`, kiểm tra TTL 24h, trả về `{ valid, cached: true/false }`
- [x] 1.4 Thêm hàm `saveLicenseCache(result)` và `clearLicenseCache()` trong `license.js`

## 2. Settings UI — License Key Section

- [ ] 2.1 Thêm section "🔑 Bản quyền" vào `options.html` (tab Cài đặt chung) — input key (password field), nút "Kích hoạt", trạng thái display
- [ ] 2.2 Thêm logic trong `options.js` — load key đã lưu, bấm "Kích hoạt" gọi `verifyLicense()`, hiển thị kết quả, lưu key vào `chrome.storage.sync`
- [ ] 2.3 Khi mở Settings, auto-check trạng thái license hiện tại và hiển thị (✅ Đã kích hoạt / ❌ Chưa kích hoạt)

## 3. Popup AI Gate

- [ ] 3.1 Thêm badge trạng thái license vào `popup.html` — hiển thị "🔓 AI sẵn sàng" hoặc "🔒 Cần key bản quyền"
- [ ] 3.2 Sửa `popup.js` — trước khi gọi `notebookChat()`, kiểm tra license (gọi `checkLicenseCache()`, nếu cache hết hạn thì re-verify)
- [ ] 3.3 Nếu license không hợp lệ: hiển thị thông báo yêu cầu nhập key, disable nút "Hỏi AI", không gọi API
- [ ] 3.4 Áp dụng gate cho tất cả đường dẫn gọi AI: nút "Hỏi AI" chính, nút fallback "Không khớp? Hỏi AI", nút "Hỏi AI" trong no-match card

## 4. Integration & Manifest

- [ ] 4.1 Đăng ký `license.js` trong `manifest.json` (nếu cần) và include trong `popup.html` + `options.html`
- [ ] 4.2 Kiểm tra tổng thể: flow nhập key → verify → cache → AI gate hoạt động end-to-end
