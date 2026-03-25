## Context

Extension Saba Hacked v1.1.0 là một Chrome Extension dùng để trích xuất câu hỏi/đáp án từ trang thi trắc nghiệm Saba elearning (elearning.agribank.com.vn), sau đó gửi lên n8n backend để tìm đáp án.

**Hiện trạng:**
- `content.js` đã có logic trích xuất câu hỏi dựa trên selectors `.scp-qtext`, `input[type="radio"]`, `label[for=...]`
- `popup.js` có `pullFromPage` lấy dữ liệu qua message `GET_QUESTION_OPTIONS`, inject `content.js` vào all frames
- Tab picker liệt kê tất cả tab http/https từ mọi cửa sổ
- Bài thi "Thi thử nghiệp vụ chi nhánh" mở trong cửa sổ popup riêng khi nhấn "Khởi chạy"

**Vấn đề:** Cần xác nhận và đảm bảo content script hoạt động đúng trong cửa sổ popup mới, hỗ trợ iframe lồng nhau, và format output rõ ràng.

## Goals / Non-Goals

**Goals:**
- Đảm bảo khi chọn đúng tab chứa bài thi và nhấn "Lấy dữ liệu", extension trích xuất được: câu hỏi + 4 đáp án A/B/C/D
- Content script hoạt động trong iframe lồng nhau của Saba
- Format output rõ ràng: câu hỏi dòng đầu, A. ..., B. ..., C. ..., D. ... ở các dòng tiếp theo

**Non-Goals:**
- Tự động đăng nhập vào elearning
- Tự động chọn bài thi
- Tự động trả lời bài thi

## Decisions

### 1. Giữ nguyên kiến trúc hiện tại
- **Quyết định**: Không thay đổi kiến trúc, chỉ cải thiện selectors và logic extraction
- **Lý do**: Extension đã có sẵn cơ chế inject content script vào all frames, tab picker, và fallback extraction. Chỉ cần tinh chỉnh selectors cho phù hợp DOM thực tế của Saba Agribank
- **Thay thế đã xem xét**: Viết lại toàn bộ extraction → không cần thiết, code hiện tại đã tốt

### 2. Sử dụng browser trực tiếp để khảo sát DOM
- **Quyết định**: Đăng nhập vào elearning, khởi chạy bài thi, và khảo sát DOM thực tế trước khi code
- **Lý do**: Selectors hiện tại (`.scp-qtext`, `qrespb.*`) có thể đã đúng hoặc cần bổ sung — cần verify bằng DOM thật
- **Thay thế**: Đoán selectors → rủi ro sai

### 3. Thêm fallback selectors cho cấu trúc DOM Saba mới
- **Quyết định**: Bổ sung thêm selectors dự phòng nếu cấu trúc DOM khác so với selectors hiện tại
- **Lý do**: Saba có thể render khác nhau tùy phiên bản, cần selectors linh hoạt

## Risks / Trade-offs

- **DOM thay đổi theo thời gian** → Selectors có thể cần cập nhật khi Saba upgrade → Mitigation: sử dụng multiple fallback selectors
- **Iframe cross-origin** → Content script không thể inject vào cross-origin iframe → Mitigation: manifest đã có `all_frames: true` và `host_permissions: ["http://*/*", "https://*/*"]`
- **Popup window có thể bị block bởi trình duyệt** → Mitigation: user cần cho phép popup từ elearning site
