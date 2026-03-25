# Design: Full Local Result Display

## Overview

Modify `renderLocalResult()` in `popup.js` to show the full question and all A/B/C/D options in the main result card, matching the format used in "Tất cả câu khớp".

## Data Available

The `result` object returned by `AnswerBank.findLocalAnswer()` already contains:
- `matchedQuestion` — full question text (currently truncated to 150 chars)
- `bankOptions` — object like `{ A: "...", B: "...", C: "...", D: "..." }`
- `mappedAnswer` — the correct answer letter (e.g., "C")
- `mappedAnswerText` — the correct answer text

## Changes

### `renderLocalResult()` in `popup.js`

1. **Show full question text** — Remove the 150-char truncation on `matchedQuestion`
2. **Show all options A/B/C/D** — After the question, render each option from `result.bankOptions`, highlighting the correct answer with bold + green color (same style as "Tất cả câu khớp")
3. **Keep existing elements** — Answer display, explanation, mapping info, and "Hỏi AI" button remain unchanged

### UI Layout (main result card)

```
📚 Tìm thấy đáp án cục bộ! (XX% khớp)
📝 Câu hỏi trong đề: [full question text]
  A. [option A text]
  B. [option B text]
  C. [option C text]  ← highlighted if correct
  D. [option D text]
Đáp án: C
[answer text]
💡 [explanation if present]
```

### Styling

- Correct option: `font-weight:600; color:#2e7d32` (green, bold)
- Other options: default text color, `font-size:12px; color:#555`
- Options container: `margin-top:4px; margin-left:4px` for visual indent
