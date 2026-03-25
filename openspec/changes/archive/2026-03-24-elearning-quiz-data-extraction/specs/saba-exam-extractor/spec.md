## Capability: saba-exam-extractor

### Description
Trích xuất câu hỏi và đáp án (A, B, C, D) từ cửa sổ thi thử nghiệp vụ chi nhánh trên Saba elearning Agribank.

### Requirements

1. **REQ-1: Chọn đúng tab/cửa sổ popup bài thi**
   - Tab picker trong popup hiển thị tất cả cửa sổ/tab http/https đang mở
   - User có thể chọn cửa sổ popup chứa bài thi từ dropdown

2. **REQ-2: Trích xuất câu hỏi**
   - Lấy text câu hỏi từ DOM (selector: `.scp-qtext` hoặc tương đương)
   - Câu hỏi được hiển thị dòng đầu tiên trong textarea

3. **REQ-3: Trích xuất đáp án A/B/C/D**
   - Lấy text các đáp án từ labels gắn với radio buttons
   - Selectors: `label[for^="qrespb."]` hoặc `.scp-dbtntxt label`, `.scp-dbtncont label`
   - Format: `A. <text>`, `B. <text>`, `C. <text>`, `D. <text>`

4. **REQ-4: Hỗ trợ iframe**
   - Content script inject vào all frames (`all_frames: true`)
   - Fallback: `chrome.scripting.executeScript` với `allFrames: true`
   - Nếu main frame không tìm thấy, iterate qua tất cả frames

5. **REQ-5: Format output**
   - Textarea hiển thị:
     ```
     <Câu hỏi>
     A. <Đáp án A>
     B. <Đáp án B>
     C. <Đáp án C>
     D. <Đáp án D>
     ```

### Acceptance Criteria
- Khi chọn đúng tab bài thi và nhấn "Lấy dữ liệu", textarea hiển thị câu hỏi + 4 đáp án
- Hoạt động cả khi bài thi render trong iframe
- Không lỗi khi bài thi chưa load xong
