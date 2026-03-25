# Notebook Selector in Settings

## What

Add a notebook selector combobox in the Settings page (General tab), allowing users to choose which AI notebook to send questions to. The list of notebooks is driven entirely by `config.json`, so the number of available notebooks depends on what the user configures there.

## Why

Currently, `config.json` has a single `notebookId` field, meaning all AI queries go to one hardcoded notebook. Users who have multiple notebooks (e.g., different subjects or departments) cannot switch between them without manually editing the config file. Adding a combobox in Settings makes this user-friendly and dynamic.

## Scope

- **`config.json`**: Change from a single `notebookId` string to a `notebooks` array, where each entry has an `id` and a `name` (display label).
- **`options.html`**: Add a `<select>` combobox in the ChatBot settings section, populated from the `notebooks` array.
- **`options.js`**: Load the notebooks array from `config.json`, populate the combobox, save selected notebook to `chrome.storage.sync`.
- **`popup.js`**: Read the selected notebook ID from `chrome.storage.sync` and use it when calling the Notebook Chat API.

## Affected code, APIs, dependencies

- `config.json` — schema change
- `options.html` — new select element
- `options.js` — load/save notebook selection
- `popup.js` — read selected notebook for AI queries
