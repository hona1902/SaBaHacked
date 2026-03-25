# Design: Notebook Selector in Settings

## Overview

Transform the single-notebook configuration into a multi-notebook configuration with a user-facing selector in Settings.

## Data Model Change

### `config.json` — Before
```json
{
  "notebookApiUrl": "https://sotay5491.io.vn/api",
  "notebookId": "notebook:orsrbbj4tvvngnpg0o1d",
  "notebookApiPassword": "[PASSWORD]",
  "sessionMode": "reuse"
}
```

### `config.json` — After
```json
{
  "notebookApiUrl": "https://sotay5491.io.vn/api",
  "notebooks": [
    {
      "id": "notebook:orsrbbj4tvvngnpg0o1d",
      "name": "Sổ tay 5491"
    }
  ],
  "notebookApiPassword": "[PASSWORD]",
  "sessionMode": "reuse"
}
```

- `notebooks` is an array of `{ id, name }` objects.
- Order in the array = order in the combobox.
- First notebook is the default if no selection is saved.
- Users can add/remove notebooks by editing `config.json` before loading the extension.

## UI Changes

### `options.html` — ChatBot section
Add a `<select id="notebookPicker">` under the ChatBot heading, before the Session Mode dropdown:

```
🤖 ChatBot - HNA Soft
┌────────────────────────────────┐
│ NOTEBOOK                       │
│ [▼ Sổ tay 5491              ] │
│                                │
│ CHẾ ĐỘ SESSION                 │
│ [▼ Dùng 1 session ...        ] │
└────────────────────────────────┘
```

### `options.js`
- On load: fetch `config.json`, read `notebooks` array, populate `#notebookPicker`.
- Save selected notebook ID to `chrome.storage.sync` key `selectedNotebookId`.
- Restore saved selection on page load.

### `popup.js`
- On "Tìm đáp án" / "Hỏi AI" click: read `selectedNotebookId` from `chrome.storage.sync`.
- Fallback: use `notebooks[0].id` if no saved selection.
- Pass selected ID to `notebookChat()`.

## Backward Compatibility

- If `config.json` still has the old `notebookId` field (no `notebooks` array), treat it as a single-element array: `[{ id: notebookId, name: notebookId }]`.
- This ensures existing installations don't break.

## Session Handling

When the user switches notebooks, the stored `currentSessionId` (used for reuse mode) should be cleared because sessions are notebook-specific. This is already handled by the existing check `stored.currentSessionNotebookId === notebookId` in `notebookChat()`.
