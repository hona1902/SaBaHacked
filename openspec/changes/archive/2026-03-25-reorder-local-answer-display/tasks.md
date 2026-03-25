# Tasks: Reorder Local Answer Display

## Task 1: Reorder and restyle renderLocalResult()

**File**: `popup.js`  
**Function**: `renderLocalResult()` (lines 560-643)

### Steps:
1. Move the answer line (`Đáp án: X`) and answer text up, right after the header
2. Combine answer letter + text into one prominent line: `🎯 Đáp án: C. 5.000.000 VND`
3. Add enhanced styling (larger font, bold, green highlight background)
4. Move mapping info (`📎 Đáp án gốc:`) right after the answer
5. Move explanation (`💡`) after the mapping
6. Move question text (`📝 Câu hỏi trong đề:`) below the answer/mapping/explanation
7. Move options A/B/C/D list below the question text

### Verification:
- Load extension, trigger a local match, verify the answer appears at top with prominent styling
- Verify question and options appear below the answer
- Verify the "All Matches" expandable section still works correctly
