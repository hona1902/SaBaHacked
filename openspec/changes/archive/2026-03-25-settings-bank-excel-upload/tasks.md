# Tasks: settings-bank-excel-upload

## 1. Add SheetJS Library

- [x] 1.1 Download `xlsx.full.min.js` from SheetJS CDN to `lib/xlsx.full.min.js`
- [x] 1.2 Add `<script src="lib/xlsx.full.min.js">` to `options.html` before `options.js`

## 2. Update options.html

- [x] 2.1 Remove the entire "📝 Thêm câu hỏi" card (lines ~404-464: the card with question form, option-grid, answer-group, and JSON import)
- [x] 2.2 Add new "📤 Upload Excel" card with: target bank dropdown, file input (.xlsx,.xls), preview area, import button
- [x] 2.3 Move "📥 Import JSON hàng loạt" into its own collapsible card (with its own bank selector)
- [x] 2.4 Add delete button (🗑️) to bundled bank items (currently only custom banks have delete buttons)

## 3. Update options.js

- [x] 3.1 Remove `addQuestion` event listener and all related form logic (qText, optA-D, correctAns, qExplanation)
- [x] 3.2 Add Excel file reader: `FileReader` → `XLSX.read()` → parse sheet rows → validate → preview count
- [x] 3.3 Add Excel import confirm: push parsed questions to `chrome.storage.local` bank
- [x] 3.4 Update `loadBankList()` to show 🗑️ delete button on ALL banks (both bundled and custom)
- [x] 3.5 Update `deleteBank()` to handle bundled banks (remove from `localBankFiles` only, don't touch storage)

## 4. Verification

- [x] 4.1 Reload extension → Settings Tab 2 → no manual question form visible
- [x] 4.2 Upload a test Excel file → preview shows correct count → import adds questions to bank
- [x] 4.3 Delete a custom bank → removed from list and storage
- [x] 4.4 Delete a bundled bank → removed from active list only
