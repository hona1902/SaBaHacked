# Design: Settings Bank Excel Upload

## Context

Tab 2 "Ngân hàng câu hỏi" trong Settings cần được cải thiện:
- Bỏ form thêm câu hỏi thủ công (quá chậm)
- Thêm upload Excel → auto convert to JSON
- Đảm bảo nút xoá hoạt động cho cả bundled & custom banks

## Approach

### 1. Excel Parsing — SheetJS (xlsx)

Sử dụng thư viện SheetJS `xlsx.full.min.js` (standalone, ~500KB) bundle cùng extension.

**Lý do chọn SheetJS:**
- Đọc `.xlsx` hoàn toàn trong browser, không cần server
- Miễn phí cho use case này (Community Edition)
- Hỗ trợ cả `.xls` và `.xlsx`

**Excel format kỳ vọng:**

| Câu hỏi | A | B | C | D | Đáp án | Giải thích |
|----------|---|---|---|---|--------|------------|
| Nội dung câu 1 | PA A | PA B | PA C | PA D | A | ... |

- Dòng 1: header (bỏ qua)
- Cột 1: question, Cột 2-5: options A-D, Cột 6: answer, Cột 7: explanation (optional)
- Hoặc header chứa từ khóa: "câu hỏi", "A", "B", "C", "D", "đáp án"

### 2. UI Changes

```
┌─ Tab 2: Ngân hàng câu hỏi ──────────────────
│
│ ┌─ Danh sách ────────────────────────────────
│ │ [Bundled] cong-nghe-so.json    50 câu [🗑️]
│ │ [Custom]  nghiep-vu.json       30 câu [🗑️]
│ └────────────────────────────────────────────
│
│ ┌─ Tạo ngân hàng mới ───────────────────────
│ │ Tên file: [________________]  [✅ Tạo]
│ └────────────────────────────────────────────
│
│ ┌─ Upload Excel ─────────────────────────────
│ │ Chọn ngân hàng: [dropdown]
│ │ [📤 Chọn file Excel...]
│ │ Preview: 25 câu hỏi hợp lệ
│ │ [✅ Import]
│ └────────────────────────────────────────────
│
│ ┌─ Import JSON (collapsible) ────────────────
│ │ ▶ Import JSON hàng loạt
│ └────────────────────────────────────────────
└──────────────────────────────────────────────
```

**Bỏ đi:** Entire "Thêm câu hỏi" card (form fields, option-grid, answer-group).

### 3. Delete Logic

- **Custom banks**: Xoá khỏi `chrome.storage.local` + `localBankFiles`
- **Bundled banks**: Chỉ xoá khỏi `localBankFiles` (bỏ khỏi danh sách active, file vẫn tồn tại trong extension package)

### 4. File Changes

| File | Action |
|------|--------|
| `options.html` | Xoá card "Thêm câu hỏi", thêm card "Upload Excel" |
| `options.js` | Xoá `addQuestion` listener, thêm Excel parsing + upload logic, sửa delete cho bundled |
| `lib/xlsx.full.min.js` | Thêm SheetJS library |

## Trade-offs

- **SheetJS ~500KB bundle** — chấp nhận được cho Chrome extension (one-time load)
- **Column detection by position** — đơn giản hơn header matching, nhưng yêu cầu user tuân thủ format
- **Kết hợp cả position và keyword**: thử detect header trước, fallback về position
