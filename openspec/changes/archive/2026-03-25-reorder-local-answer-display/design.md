# Design: Reorder Local Answer Display

## Approach

Modify `renderLocalResult()` in `popup.js` to reorder the HTML output blocks. No logic changes — purely repositioning existing HTML generation code.

## Changes to `popup.js` → `renderLocalResult()`

### New rendering order (inside the main card div):

1. **Header** — `📚 Tìm thấy đáp án cục bộ! (X% khớp)` (unchanged)

2. **Answer block (MOVED UP + enhanced styling)**:
   - Combine answer letter + text on one line: `Đáp án: C. 5.000.000 VND`
   - Use larger font, bold, green background for prominence
   - Styled as a highlighted "hero" answer block

3. **Mapping info** — `📎 Đáp án gốc: B. → Đã ánh xạ sang C` (moved up)

4. **Explanation** — `💡 ...` (moved up, before question)

5. **Question text** — `📝 Câu hỏi trong đề:` (moved down)

6. **Options A/B/C/D** from bank (moved down)

### Styling enhancement for the answer block:

```html
<div style="margin:8px 0; padding:10px 12px; background:#c8e6c9; border-radius:6px; font-size:15px; font-weight:700; color:#1b5e20;">
  🎯 Đáp án: C. 5.000.000 VND
</div>
```

## Files Modified

| File | Change |
|------|--------|
| `popup.js` | Reorder HTML blocks in `renderLocalResult()` (lines 560-643) |
