## Why

Extension Saba Hacked hiện tại đã có chức năng "Lấy dữ liệu" (pullFromPage) để trích xuất câu hỏi và đáp án từ trang thi trắc nghiệm Saba elearning. Tuy nhiên, khi người dùng khởi chạy bài thi "Thi thử nghiệp vụ chi nhánh" trên https://elearning.agribank.com.vn/, hệ thống mở ra một cửa sổ popup mới. Extension cần hỗ trợ tốt hơn việc:
1. Chọn đúng tab/cửa sổ popup chứa bài thi
2. Trích xuất câu hỏi + đáp án A, B, C, D một cách chính xác từ cửa sổ đó

## What Changes

- **Cải thiện content script extraction**: Cập nhật selectors trong `content.js` để hoạt động chính xác hơn trên giao diện Saba elearning của Agribank (cửa sổ popup thi thử nghiệp vụ)
- **Cải thiện tab picker**: Đảm bảo `popup.js` liệt kê chính xác các cửa sổ popup mới mở từ elearning và cho phép chọn đúng tab
- **Cải thiện hiển thị kết quả**: Format text câu hỏi + 4 đáp án A/B/C/D rõ ràng trong textarea
- **Hỗ trợ iframe/cross-frame**: Bài thi Saba thường render trong iframe lồng nhau, cần đảm bảo content script inject vào tất cả frames

## Capabilities

### New Capabilities
- `saba-exam-extractor`: Trích xuất câu hỏi và đáp án từ cửa sổ thi Saba elearning Agribank, hỗ trợ cả iframe và popup windows

### Modified Capabilities
_(Không có capability hiện tại nào bị thay đổi ở mức spec)_

## Impact

- **Files bị ảnh hưởng**: `content.js` (selectors extraction), `popup.js` (tab picker + format output)
- **Dependencies**: Không thay đổi
- **Systems**: Extension Chrome hoạt động trên https://elearning.agribank.com.vn/
