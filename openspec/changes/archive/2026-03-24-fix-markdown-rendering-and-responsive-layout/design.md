# Design: Fix Markdown Rendering & Responsive Layout

## 1. Markdown Rendering for AI Responses

### Current Behavior
`renderNotebookResult()` in `popup.js` (line 337-346) uses `escapeHtml(content)` inside a `white-space: pre-wrap` div. This shows raw `**bold**` markers and doesn't format lists or paragraphs.

### Solution
Add a lightweight `simpleMarkdownToHtml(text)` function that converts:
- `**text**` → `<strong>text</strong>`
- `*text*` → `<em>text</em>`
- `\n` → `<br>` (preserving paragraph breaks)
- `- item` or `* item` at line start → `<li>` wrapped in `<ul>`
- `[source_insight:...]` / `[source:...]` citation tags → styled `<span class="cit">`

Update `renderNotebookResult()` to use `simpleMarkdownToHtml()` instead of `escapeHtml()`, and remove `white-space: pre-wrap` from the result container style.

### Why Not a Full Markdown Library
- The extension must stay lightweight (no external dependencies).
- AI responses use a small subset of markdown (bold, italic, lists, newlines).
- A regex-based converter is sufficient and keeps bundle size minimal.

## 2. Responsive Layout (Fill Window on Resize)

### Current Behavior
- `body` has `min-width: 380px; max-width: 720px` — no height constraints.
- `.content` is flex column but has no `flex: 1` to fill available space.
- `textarea` has a fixed `height: 180px`.
- `.results` has `max-height: 50vh` — limits content visibility.
- When the window is resized larger, content stays at the top with empty space below.

### Solution
Make the entire layout flex-column from `html` → `body` → `.content`:

1. `html, body` → `height: 100%; display: flex; flex-direction: column;`
2. `.content` → `flex: 1; overflow: auto;`
3. `textarea` → `flex-shrink: 0; min-height: 120px;` (keep current height but don't force it)
4. `.results` → `flex: 1; max-height: none;` (grow to fill remaining space)
5. Remove `max-width: 720px` from body (the window size is already set by `chrome.windows.create`).

## Files Affected

| File | Change |
|------|--------|
| `popup.js` | Add `simpleMarkdownToHtml()`, update `renderNotebookResult()` |
| `popup.css` | Add flex layout for `html`, `body`, `.content`; adjust `.results` and `textarea` |
