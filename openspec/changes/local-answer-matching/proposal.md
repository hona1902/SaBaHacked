# Local Answer Matching Before Webhook Fallback

## What

Thêm cơ chế dò đáp án cục bộ (local matching) ngay trong extension trước khi gửi câu hỏi lên webhook n8n. Extension sẽ load một ngân hàng câu hỏi & đáp án dạng JSON, khi nhấn "Tìm đáp án", nó sẽ:

1. **Dò câu hỏi** trong ngân hàng cục bộ bằng text similarity (Jaccard / normalized substring matching)
2. **Map đáp án** từ ngân hàng sang thứ tự A/B/C/D thực tế trên đề thi (xử lý đảo thứ tự)
3. **Chỉ gửi lên webhook** khi không tìm thấy câu nào khớp (score dưới ngưỡng)

## Why

- **Tốc độ**: Dò cục bộ gần như tức thì (< 50ms), không cần đợi network round-trip tới n8n (thường 2-5s)
- **Tiết kiệm**: Giảm tải cho server n8n và API Gemini/embedding khi câu hỏi đã có sẵn trong ngân hàng
- **Offline capability**: Vẫn hoạt động khi mất kết nối internet (cho các câu đã có trong ngân hàng)
- **Xử lý đảo thứ tự**: Extension đã extract được options từ DOM → có thể map đáp án đúng dù đề thi đảo A/B/C/D

## Scope

### In scope
- Module `answer-bank.js` xử lý load/match/map đáp án cục bộ
- Sửa `popup.js` để check local trước, fallback webhook
- Hỗ trợ nhiều file JSON ngân hàng câu hỏi (mỗi nghiệp vụ 1 file)
- Thuật toán text similarity: Jaccard similarity + normalized substring matching
- Thuật toán option mapping: so sánh text đáp án DB với đáp án trên đề (hỗ trợ đảo thứ tự)

### Out of scope
- UI quản lý ngân hàng câu hỏi trong extension
- Tự động cập nhật ngân hàng từ server
- OCR/image-based matching

## Affected code, APIs, dependencies, systems

- `popup.js` — thêm local matching logic trước webhook call
- `answer-bank.js` — module mới để load/match JSON question bank
- `manifest.json` — khai báo thêm file JSON question bank
- Các file JSON ngân hàng câu hỏi (đã có `Trắc nghiệm công nghệ số.json`)
