# Reorder Local Answer Display

## What

Reorder the "Tìm thấy đáp án cục bộ!" result card so the **answer** and **mapping info** appear at the top (most prominent), followed by the question text and options below.

### Current layout order:
1. Header "📚 Tìm thấy đáp án cục bộ!"
2. 📝 Câu hỏi trong đề + question text
3. Options A/B/C/D
4. Đáp án: C
5. Answer text (e.g. "5.000.000 VND")
6. 📎 Đáp án gốc mapping info
7. 💡 Explanation

### Desired layout order:
1. Header "📚 Tìm thấy đáp án cục bộ!"
2. **Đáp án: C. 5.000.000 VND** (combined, prominent styling)
3. 📎 Đáp án gốc mapping info
4. 💡 Explanation
5. 📝 Câu hỏi trong đề + question text
6. Options A/B/C/D

## Why

The most important information users need is the **answer** — they want to see it immediately without scrolling past the question and options they already know. Moving the answer to the top with prominent styling provides a better UX for quick answer verification during quizzes.

## Scope

- **File**: `popup.js` — `renderLocalResult()` function (lines 560-643)
- **Impact**: UI rendering only, no logic changes

## Out of Scope

- Answer matching logic (no changes to `answer-bank.js`)
- "All Matches" expandable section ordering
- AI query flow
