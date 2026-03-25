# Tasks: Bank Management Enhancements

## Task 1: Increase popup height
- Add `min-height: 520px` to body in `popup.css`

## Task 2: Delete individual questions
- In `options.html`, add a collapsible question list area inside each bank-item
- In `options.js`:
  - Add click handler on `.bank-name` to expand/collapse question list
  - Render each question with index and ❌ delete button
  - Implement `deleteQuestion(bankName, index)` — removes from array, saves storage
  - Bundled banks are read-only (no delete buttons)
  - Re-render list after deletion

## Task 3: Vietnamese no-diacritics bank name validation
- In `options.js`, add `input` event listener on `#newBankName`
- Strip any characters not matching `[a-z0-9\-]` in realtime
- The existing `replace()` on submit already handles this, but realtime feedback is better UX

## Task 4: Remove JSON import feature
- In `options.html`, delete lines 463-477 (the Import JSON card)
- In `options.js`, delete lines 354-390 (the import handler)
- In `loadBankList()`, remove `selectJsonEl` / `targetBankJson` references
