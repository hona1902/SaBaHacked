# Spec: Config File & Settings Cleanup

## config.json
- **Path**: Extension root (`config.json`)
- **Format**: JSON with keys `notebookApiUrl`, `notebookId`, `notebookApiPassword`
- **Must be listed in `manifest.json` `web_accessible_resources`** so it can be fetched via `chrome.runtime.getURL()`

## Settings Load Flow
1. Fetch `config.json` via `chrome.runtime.getURL('config.json')`
2. Read `chrome.storage.sync` for user overrides
3. Merge: storage values override config defaults (only if non-empty)

## Masked Fields
- All 3 notebook fields: `type="password"`
- Each field has a 👁️ toggle button that switches between `password` and `text`

## Removed Fields
- `endpoint` (n8n RAG endpoint)
- `apiKey` (n8n API key)
