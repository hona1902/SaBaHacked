# Tasks: Fix Local Answer Highlight

- [x] **Fix bank option highlighting in `renderLocalResult()`**
  - File: `popup.js`, line ~591
  - Change `result.mappedAnswer` → `result.originalAnswer` in the `isCorrect` check for bank options display
  - This ensures the correct bank option (by bank letter) is highlighted green, not the shuffled page letter
