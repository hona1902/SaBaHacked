# Fix Local Answer Highlight Display Bug

## What

Fix the incorrect answer highlighting in the bank options display when the local quiz matching engine maps a shuffled answer. Currently, the main result card highlights the wrong option letter in the "bank options" list because it uses `mappedAnswer` (page-shuffled letter) instead of `originalAnswer` (bank letter).

## Why

When the Saba platform shuffles quiz options (e.g., bank answer is B but maps to page position C), the `renderLocalResult()` function in `popup.js` incorrectly uses the **mapped** (page-order) letter to highlight options in the **bank's** own A/B/C/D list. This confuses users because the highlighted option text doesn't match the displayed correct answer text.

**Example from user report:**
- Bank answer is **B** → correctly mapped to page **C** (100% match)
- But in the bank options list, option **C** is highlighted instead of option **B**
- The highlighted C text is different from the actual correct answer text shown above

## Scope

- **File**: `popup.js` — `renderLocalResult()` function
- **Line**: ~591 — the `isCorrect` check for bank options highlighting
- **Impact**: Display-only bug, no logic or answer accuracy impact
