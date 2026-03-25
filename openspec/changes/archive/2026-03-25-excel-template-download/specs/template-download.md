# Spec: Excel Template Download

## ADDED Requirements

### Requirement 1: Download Template Button
- **GIVEN** user is on Tab 2 "Ngân hàng câu hỏi", in the "Upload Excel" card
- **WHEN** user clicks "📥 Tải file mẫu Excel"
- **THEN** browser downloads a file `mau-ngan-hang-cau-hoi.xlsx` containing header row and 2 sample questions in the correct format

### Requirement 2: Template Content
- **GIVEN** the downloaded template file
- **WHEN** user opens it in Excel
- **THEN** it contains:
  - Row 1 (header): Câu hỏi | A | B | C | D | Đáp án | Giải thích
  - Row 2-3: Sample questions with complete data
  - Readable column widths
