# Design: Bank Management Enhancements

## 1. Increase Popup Height

**File**: `popup.css`

Add `min-height: 520px` to the `body` rule to give more vertical space for results.

## 2. Delete Individual Questions

**File**: `options.html` + `options.js`

### UI Design
When a bank item is clicked, expand to show a scrollable list of questions with delete buttons:

```
📚 data/cong-nghe-so.json    [45 câu]  🗑️
  ├─ 1. Câu hỏi ABC...                  ❌
  ├─ 2. Câu hỏi DEF...                  ❌
  └─ 3. Câu hỏi GHI...                  ❌
```

### Logic (`options.js`)
- Add click handler on `.bank-name` to toggle expand/collapse
- Render questions list with index and delete button
- Delete button removes by array index, saves to storage, re-renders
- Only custom banks allow question deletion (bundled = read-only)

## 3. Vietnamese No-Diacritics Bank Names

**File**: `options.js`

Current regex: `name.replace(/[^a-zA-Z0-9\-_]/g, '-')`

This already strips diacritics. Enhance with:
- Realtime `input` event listener that strips invalid chars as user types
- Show a hint message if diacritics detected

## 4. Remove JSON Import

**Files**: `options.html` + `options.js`

- Delete the `<!-- Import JSON -->` card (lines 463-477 in HTML)
- Delete the JSON import handler (lines 354-390 in JS)
- Remove `targetBankJson` references from `loadBankList()`
