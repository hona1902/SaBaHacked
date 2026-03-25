# Design: Remove n8n & Mask Settings

## Architecture

### Config File (`config.json`)
A new file at the extension root provides default values. This file ships with the extension and is read-only for the code — users change values via the Settings UI, which saves overrides to `chrome.storage.sync`.

```json
{
  "notebookApiUrl": "https://sotay5491.io.vn/api",
  "notebookId": "notebook:orsrbbj4tvvngnpg0o1d",
  "notebookApiPassword": ""
}
```

### Load Priority
1. **`chrome.storage.sync`** — user-saved overrides (highest priority)
2. **`config.json`** — shipped defaults (loaded via `fetch(chrome.runtime.getURL('config.json'))`)

On first install, `chrome.storage.sync` is empty → defaults from `config.json` are used. Once the user clicks "Save", values go into `chrome.storage.sync` and take priority.

### UI Changes
- Remove: `endpoint` field, `apiKey` field
- Keep: `hostPatterns` textarea
- Mask: All 3 notebook fields use `type="password"`
- Each masked field gets a 👁️ toggle button to reveal/hide

### popup.js Changes
- Remove: `endpoint`, `apiKey` from `chrome.storage.sync.get()` defaults
- Remove: Entire webhook fallback code path
- Remove: `renderLoading()` function (replaced by notebook loading message)
- Keep: `notebookChat()`, `renderNotebookResult()`, local matching logic
