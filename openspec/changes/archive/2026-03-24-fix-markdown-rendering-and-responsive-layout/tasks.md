# Tasks

## 1. Add markdown-to-HTML converter in popup.js
- [ ] Create `simpleMarkdownToHtml(text)` function that handles `**bold**`, `*italic*`, line breaks, bullet lists, and citation tags
- [ ] Update `renderNotebookResult()` to use `simpleMarkdownToHtml()` instead of `escapeHtml()` + `pre-wrap`

## 2. Fix responsive layout in popup.css
- [ ] Set `html, body` to `height: 100%` with flex column layout
- [ ] Set `.content` to `flex: 1` so it fills available vertical space
- [ ] Adjust `.results` to remove `max-height: 50vh` and grow with flex
- [ ] Adjust `textarea` to use `min-height` instead of fixed `height`
