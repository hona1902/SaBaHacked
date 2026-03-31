## ADDED Requirements

### Requirement: License key input in Settings
Hệ thống SHALL hiển thị ô nhập License Key trong trang Settings (tab Cài đặt chung), bao gồm input field, nút "Kích hoạt", và trạng thái hiện tại.

#### Scenario: User nhập key và kích hoạt thành công
- **WHEN** user nhập license key hợp lệ vào ô input và bấm "Kích hoạt"
- **THEN** hệ thống gọi API verify với key + fingerprint máy, hiển thị "✅ Đã kích hoạt" và lưu key vào storage

#### Scenario: User nhập key không hợp lệ
- **WHEN** user nhập license key sai và bấm "Kích hoạt"
- **THEN** hệ thống hiển thị "❌ Key không hợp lệ hoặc không khớp máy này" và không lưu key

#### Scenario: Hiển thị trạng thái khi mở Settings
- **WHEN** user mở trang Settings và đã có key lưu trước đó
- **THEN** hệ thống hiển thị key đã nhập (masked) và trạng thái kích hoạt hiện tại

### Requirement: Machine fingerprint generation
Hệ thống SHALL sinh một fingerprint duy nhất cho mỗi máy/trình duyệt bằng cách hash các thuộc tính navigator (userAgent, language, screenWidth, screenHeight, timezone).

#### Scenario: Sinh fingerprint nhất quán
- **WHEN** hệ thống sinh fingerprint trên cùng một máy/trình duyệt nhiều lần
- **THEN** fingerprint trả về MUST giống nhau mỗi lần

#### Scenario: Fingerprint khác nhau giữa các máy
- **WHEN** hệ thống sinh fingerprint trên hai máy/trình duyệt khác nhau
- **THEN** fingerprint MUST khác nhau (high probability)

### Requirement: License verification API call
Hệ thống SHALL gọi API endpoint `POST {baseUrl}/api/license/verify` gửi body `{ key, fingerprint }` và nhận response `{ valid: boolean, expiresAt?: string }`.

#### Scenario: API trả về valid
- **WHEN** server trả về `{ valid: true }`
- **THEN** hệ thống cache kết quả với TTL 24 giờ và cho phép sử dụng tính năng AI

#### Scenario: API trả về invalid
- **WHEN** server trả về `{ valid: false }`
- **THEN** hệ thống xóa cache cũ (nếu có) và chặn tính năng AI

#### Scenario: API lỗi mạng
- **WHEN** gọi API verify thất bại do lỗi mạng
- **THEN** hệ thống sử dụng cache verify cũ (nếu còn hạn), nếu không có cache thì chặn AI

### Requirement: AI feature gating
Hệ thống SHALL chặn tất cả các đường dẫn gọi Notebook API nếu license chưa được xác thực.

#### Scenario: Bấm "Hỏi AI" khi chưa có license
- **WHEN** user bấm nút "Hỏi AI" hoặc fallback "Hỏi AI" mà chưa nhập/kích hoạt license key
- **THEN** hệ thống hiển thị thông báo "🔒 Vui lòng nhập Key bản quyền trong Cài đặt để sử dụng tính năng AI" và KHÔNG gọi Notebook API

#### Scenario: Bấm "Hỏi AI" khi license hợp lệ
- **WHEN** user bấm nút "Hỏi AI" và license đã được xác thực (cached valid)
- **THEN** hệ thống cho phép gọi Notebook API bình thường

#### Scenario: License hết hạn cache
- **WHEN** user bấm "Hỏi AI" và cache verify đã quá 24 giờ
- **THEN** hệ thống re-verify license trước khi cho phép gọi AI

### Requirement: License status display on popup
Hệ thống SHALL hiển thị trạng thái license trên popup để user biết tính năng AI có khả dụng hay không.

#### Scenario: License đã kích hoạt
- **WHEN** popup được mở và license đã verified
- **THEN** hiển thị badge "🔓 AI sẵn sàng" màu xanh nhỏ gọn

#### Scenario: License chưa kích hoạt
- **WHEN** popup được mở và chưa có license hoặc license invalid
- **THEN** hiển thị badge "🔒 Cần key bản quyền" màu cam, nút "Hỏi AI" bị disable với tooltip giải thích
