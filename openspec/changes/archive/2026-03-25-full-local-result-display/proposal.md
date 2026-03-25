# Full Local Result Display

## What

Enhance the "Tìm thấy đáp án cục bộ!" section in `popup.js` to display the full question text and all options (A, B, C, D) with the correct answer highlighted — matching the same format already used in the "Tất cả câu khớp" expandable section.

## Why

Currently, when a local match is found, the main result area only shows:
- A truncated question (first 150 chars)
- The answer letter and answer text

This makes it difficult for users to verify whether the match is correct, because they cannot see:
1. The full question text
2. All available options (A, B, C, D)

The "Tất cả câu khớp" expandable section already shows this information in full, so users have to manually expand it to verify. The main result should display the same level of detail for immediate verification.

## Scope

- **File**: `popup.js` — `renderLocalResult()` function (lines 560–629)
- **No backend changes** — the data is already available in the `result` object (`bankOptions`, `matchedQuestion`)
