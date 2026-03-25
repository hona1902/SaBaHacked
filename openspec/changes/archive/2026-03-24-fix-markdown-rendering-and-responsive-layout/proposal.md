# Fix Markdown Rendering and Responsive Layout

## What

Fix two UI issues in the Saba Hacked Chrome extension:

1. **Markdown rendering in AI responses**: When the AI (Open Notebook) returns text with markdown formatting (e.g., `**bold**`, `*italic*`, bullet lists), the raw markdown symbols are displayed as-is because the response is rendered using `escapeHtml()` + `white-space: pre-wrap`. This makes the response ugly and hard to read.

2. **Window resize not filling content**: When the extension popup window is resized (it opens as a standalone `chrome.windows.create` popup at 800×600), the interface (textarea, results area, etc.) does not expand to fill the available space. The layout remains fixed-width and doesn't stretch vertically.

## Why

- AI responses with raw `**` markers and flat formatting are confusing for users who expect clean, readable text.
- The extension window looks broken when resized — large empty spaces appear while content stays cramped at the top.
- Both issues degrade the professional look and usability of the extension.

## Scope

- **popup.js**: Add a lightweight markdown-to-HTML converter for AI responses (handle `**bold**`, `*italic*`, newlines, bullet lists, and clean up `[source_*]` citation tags).
- **popup.css**: Add flex-based layout so `html`, `body`, `.content`, `textarea`, and `.results` stretch to fill the window height.
- **popup.html**: No structural changes expected.

## Out of Scope

- Full markdown library (marked.js, etc.) — keep it lightweight with a custom regex-based converter.
- Changes to the AI backend or webhook response format.
