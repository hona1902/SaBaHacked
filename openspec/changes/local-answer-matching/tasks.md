# Tasks: Local Answer Matching

## 1. Tạo module `answer-bank.js`
- [ ] Implement hàm `normalize(text)` — lowercase, bỏ dấu tiếng Việt, bỏ ký tự đặc biệt, collapse whitespace
- [ ] Implement hàm `jaccardSimilarity(a, b)` — Jaccard word similarity trên text đã normalize
- [ ] Implement hàm `textSimilarity(a, b)` — 3 tầng: exact match (1.0) → substring (0.95) → jaccard
- [ ] Implement hàm `loadAnswerBank(filePaths)` — fetch JSON files bundled trong extension, merge và cache kết quả
- [ ] Implement hàm `findLocalAnswer(question, pageOptions, bank)` — tìm câu khớp nhất trong bank, map đáp án theo thứ tự trên đề

## 2. Tạo file JSON ngân hàng câu hỏi mẫu
- [ ] Tạo thư mục `data/`
- [ ] Tạo file `data/cong-nghe-so.json` với format chuẩn `[{question, options:{A,B,C,D}, answer, explanation}]`
- [ ] Populate với ít nhất 5-10 câu hỏi mẫu để test

## 3. Cập nhật `manifest.json`
- [ ] Thêm `answer-bank.js` vào scripts nếu cần (hoặc import từ popup.js)
- [ ] Thêm `data/*.json` vào `web_accessible_resources` để popup có thể fetch

## 4. Sửa `popup.js` — tích hợp local matching
- [ ] Import/load module `answer-bank.js`
- [ ] Sửa handler nút "Tìm đáp án" (`#ask` click):
  - Load ngân hàng câu hỏi (cached)
  - Gọi `findLocalAnswer()` với câu hỏi và options đã extract
  - Nếu tìm thấy (score ≥ threshold): render kết quả cục bộ, KHÔNG gửi webhook
  - Nếu không tìm thấy: fallback gửi webhook như cũ
- [ ] Thêm hàm `renderLocalResult(matchResult)` — hiển thị kết quả local match trong `#results`

## 5. Testing thủ công
- [ ] Test với câu hỏi exact match
- [ ] Test với câu hỏi đảo thứ tự A/B/C/D
- [ ] Test với câu hỏi không có trong ngân hàng (phải fallback webhook)
- [ ] Test cache — load lần 2 phải dùng cache
