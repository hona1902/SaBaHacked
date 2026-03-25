# Design: Local Answer Matching

## Context

Extension hiện tại luôn gửi câu hỏi lên webhook n8n để dò đáp án. Workflow n8n sử dụng embedding + cosine similarity trên Postgres (vector search) rồi dùng Jaccard similarity để map đáp án theo thứ tự đảo. Ta muốn nhân bản logic matching này sang phía client (extension) để dò cục bộ trước.

## Approach: Normalized Text Matching + Jaccard Similarity

### Vì sao không dùng vector embedding ở client?
- Embedding model cần WASM/WebGL runtime nặng (~50-200MB), không phù hợp cho popup extension
- Tốn thời gian load model lần đầu

### Giải pháp: Text-based matching (2 tầng)

**Tầng 1 — Exact/substring match trên câu hỏi (normalized)**
```
normalize(text) → lowercase, bỏ dấu, bỏ ký tự đặc biệt, collapse whitespace
```
So sánh câu hỏi hiện tại với toàn bộ ngân hàng. Nếu `includes` hoặc exact match → score = 1.0

**Tầng 2 — Jaccard word similarity**
```
jaccard(A, B) = |A ∩ B| / |A ∪ B|   (trên tập word sau normalize)
```
Chọn câu có score cao nhất, chỉ accept nếu score ≥ THRESHOLD (mặc định 0.65)

### Thuật toán map đáp án với thứ tự đảo

Khi tìm được câu hỏi match trong ngân hàng:
1. Lấy đáp án đúng từ DB (ví dụ: `Answer = "B"`, `OptionB = "Sử dụng AI..."`)
2. Lấy text đáp án đúng: `answerText = options[Answer]`
3. So sánh `answerText` với từng option trên đề thi (đã extract từ DOM)
4. Dùng Jaccard similarity để tìm option trùng khớp nhất
5. Return chữ cái tương ứng trên đề (A/B/C/D theo vị trí thực tế)

```
DB:    Answer=B, OptionB="Sử dụng AI để phân tích"
Đề:    A) Sử dụng AI để phân tích   ← match! → Đáp án = A
       B) Quản lý dữ liệu thủ công
       C) Không áp dụng công nghệ
       D) Chỉ dùng Excel
```

## Data format — Question Bank JSON

```json
[
  {
    "question": "Công cụ AI nào được mô tả là ...",
    "options": {
      "A": "Copilot",
      "B": "ChatGPT",
      "C": "NotebookLM",
      "D": "Gemini"
    },
    "answer": "C",
    "explanation": "NotebookLM được Google mô tả là..."
  }
]
```

Mỗi nghiệp vụ có thể có 1 file JSON riêng. File được bundle cùng extension (`web_accessible_resources` hoặc load qua `fetch` nội bộ).

## Architecture

```
[Nhấn "Tìm đáp án"]
       │
       ▼
  ┌─────────────────┐
  │  Load JSON bank  │  (cached sau lần đầu)
  └────────┬────────┘
           ▼
  ┌─────────────────────┐
  │ Normalize question   │
  │ Match against bank   │
  │ (exact → jaccard)    │
  └────────┬────────────┘
           │
     score ≥ 0.65?
      ╱          ╲
    YES           NO
     │             │
     ▼             ▼
  Map đáp án     Gửi webhook
  theo thứ tự    (flow cũ)
  trên đề
     │
     ▼
  Render kết quả
  + highlight
```

## File structure

```
answer-bank.js          ← Module: load bank, match, map answer
data/
  cong-nghe-so.json     ← Ngân hàng câu hỏi (1 file/chủ đề)
  tin-dung-ca-nhan.json
  ...
popup.js                ← Sửa: gọi local match trước webhook
manifest.json           ← Sửa: khai báo data/*.json
```

## Risks and Trade-offs

- **Kích thước**: Mỗi file JSON ~50-200KB cho ~200-500 câu → chấp nhận được cho extension
- **Maintenance**: Cần cập nhật JSON thủ công khi có câu hỏi mới → future work: auto-sync
- **Accuracy**: Text matching không chính xác bằng vector embedding, nhưng đủ tốt cho câu hỏi trắc nghiệm tiếng Việt (từ khóa chuyên ngành giúp phân biệt)
- **Threshold tuning**: 0.65 là giá trị khởi đầu, có thể cần điều chỉnh qua testing thực tế
