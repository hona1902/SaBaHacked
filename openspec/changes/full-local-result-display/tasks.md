# Tasks: Full Local Result Display

## Task 1: Update `renderLocalResult()` in `popup.js`

**File**: `popup.js` (lines 560–629)

### Changes:
1. Remove 150-char truncation on `result.matchedQuestion` — show full question
2. After the question line, add a new block rendering all options from `result.bankOptions`
3. Highlight the correct answer option (matching `result.mappedAnswer`) with green bold styling
4. Keep all existing elements (answer display, explanation, mapping info, "Hỏi AI" button)

### Acceptance Criteria:
- Full question text is displayed without truncation
- All options (A, B, C, D) are shown below the question
- Correct answer option is highlighted in green bold
- Layout matches the style used in "Tất cả câu khớp" section
- No changes to answer matching logic or data structures
