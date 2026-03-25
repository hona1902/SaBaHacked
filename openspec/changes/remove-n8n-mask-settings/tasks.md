# Tasks: Remove n8n & Mask Settings

## Tasks

- [ ] Create `config.json` with default notebook settings
- [ ] Update `manifest.json` to include `config.json` in `web_accessible_resources`
- [ ] Update `options.html`: Remove n8n fields, mask notebook fields, add toggle buttons
- [ ] Update `options.js`: Load defaults from `config.json`, remove n8n save/load
- [ ] Update `popup.js`: Remove n8n endpoint/apiKey references and webhook fallback code
