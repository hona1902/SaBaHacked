# Spec: Excel Upload Feature

## ADDED Requirements

### Requirement 1: Upload Excel File
- **GIVEN** user is on Tab 2 "Ngân hàng câu hỏi" and has selected a target bank
- **WHEN** user clicks "📤 Chọn file Excel" and selects a `.xlsx` or `.xls` file
- **THEN** system reads the file using SheetJS, parses rows into question objects, shows preview count, and allows user to confirm import

### Requirement 2: Excel Column Detection
- **GIVEN** an Excel file with columns ordered: Câu hỏi | A | B | C | D | Đáp án | Giải thích
- **WHEN** the file is parsed
- **THEN** system maps column 1→question, 2→A, 3→B, 4→C, 5→D, 6→answer, 7→explanation; skips header row; skips rows missing question or answer

### Requirement 3: Smart Header Detection
- **GIVEN** an Excel file where row 1 contains Vietnamese headers like "Câu hỏi", "Đáp án"
- **WHEN** the file is parsed
- **THEN** system detects header keywords and maps columns accordingly, falling back to positional mapping if no keywords found

## MODIFIED Requirements

### Requirement 4: Delete Any Bank
- **GIVEN** bank list shows both bundled and custom banks
- **WHEN** user clicks 🗑️ on a bundled bank
- **THEN** the bank is removed from `localBankFiles` (stops being used for matching) but the file remains in the extension package
- **WHEN** user clicks 🗑️ on a custom bank
- **THEN** both the `localBankFiles` entry and `chrome.storage.local` data are deleted

## REMOVED Requirements

### Requirement 5: Remove Manual Question Form
- **GIVEN** current UI has a card "📝 Thêm câu hỏi" with individual input fields
- **WHEN** this change is applied
- **THEN** the entire manual question form is removed from HTML and JS
