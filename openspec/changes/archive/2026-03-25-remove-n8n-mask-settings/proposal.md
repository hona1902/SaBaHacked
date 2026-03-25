# Remove n8n Settings & Mask Notebook Credentials

## What

Remove the n8n RAG endpoint and API key fields from settings since they are no longer needed. Store the Open Notebook settings (API URL, Notebook ID, API Password) with defaults from a config file (`config.json`). Mask all 3 notebook fields as password-type inputs (shown as `*****`).

## Why

- n8n webhook integration is deprecated — the extension now uses Open Notebook API exclusively
- Credentials should be pre-loaded from a config file so users don't have to manually type them after each install
- Sensitive fields (API URL, Notebook ID, Password) should be masked for security

## Scope

- `options.html` — Remove n8n fields, change notebook fields to `type="password"`
- `options.js` — Remove n8n load/save logic, load defaults from `config.json`
- `popup.js` — Remove n8n endpoint references and fallback webhook code
- `config.json` — New file with default notebook settings
