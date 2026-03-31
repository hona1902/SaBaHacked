## Why

Ngân hàng câu hỏi "bundled" (tạo sẵn, ví dụ `data/cong-nghe-so.json`) không thể xóa được. Sau khi nhấn nút xóa và confirm, ngân hàng biến mất nhưng khi reload lại settings hoặc chuyển tab, nó lại xuất hiện trở lại.

**Root cause**: Hàm `getBankFiles()` có default value là `'data/cong-nghe-so.json'`. Khi xóa bundled bank, danh sách `localBankFiles` trở thành chuỗi rỗng `""`. Lần đọc tiếp theo, `chrome.storage.sync.get()` trả về default value, khiến bundled bank tự động xuất hiện lại.

## What Changes

- Sửa logic `deleteBank()` để khi xóa bundled bank, lưu một marker rõ ràng vào storage thay vì chỉ filter ra khỏi danh sách (vì danh sách rỗng sẽ bị default value ghi đè).
- Sửa `getBankFiles()` để kiểm tra marker của bundled bank đã bị xóa, không thêm lại vào danh sách.
- Hoặc cách đơn giản hơn: thay đổi cơ chế default value — khi `localBankFiles` đã được user thay đổi (kể cả xóa hết), không dùng default bundled path nữa.

## Capabilities

### New Capabilities
_(Không có capability mới)_

### Modified Capabilities
- `options-page-module`: Sửa logic xóa/quản lý bundled bank để đảm bảo bundled bank bị xóa sẽ không tự xuất hiện lại.

## Impact

- **File bị ảnh hưởng**: `options.js` — hàm `getBankFiles()`, `deleteBank()`, và có thể `loadBankList()`
- **Storage key**: `localBankFiles` (sync) — cần thêm cơ chế phân biệt "chưa bao giờ cấu hình" vs "đã xóa hết"
- **Không ảnh hưởng**: `answer-bank.js`, `popup.js` — module matching vẫn hoạt động bình thường dựa trên danh sách bank files được truyền vào
