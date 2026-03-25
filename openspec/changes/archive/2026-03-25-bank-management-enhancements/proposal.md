# Bank Management Enhancements

## What

Four changes to the SabaHacked extension settings and popup:

1. **Increase popup height** — add `min-height` to the popup body so results area has more space
2. **Delete individual questions** — allow clicking a bank to expand it and see/delete individual questions (currently only bank-level delete exists)
3. **Vietnamese no-diacritics bank names** — restrict "Tạo ngân hàng mới" input to Vietnamese unaccented characters only (`a-z`, `0-9`, `-`)
4. **Remove "Import JSON hàng loạt"** — delete the JSON import card from options page and its JS handler

## Why

1. The popup is too short to display results comfortably
2. Users need to remove individual wrong/duplicate questions without deleting the entire bank
3. Bank names with special characters cause issues — enforce clean kebab-case (tiếng Việt không dấu)
4. JSON import is rarely used and adds UI clutter — Excel upload is sufficient

## Scope

- `popup.css` — body min-height
- `options.html` — new expandable question list per bank, remove JSON import section
- `options.js` — question delete logic, bank name validation, remove JSON import handler
