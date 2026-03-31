# Proposal: Hide Host Patterns Configuration

## Why

The Host Patterns configuration is currently exposed in the settings page, which may confuse average users who don't understand regular expressions. Providing this text box to the user risks them accidentally breaking the extension by entering invalid regex or deleting the patterns. The admin prefers to hide this UI block (the label, the text box, and the helper text) so that it operates transparently in the background.

## What Changes

- Hide the entire `Host Patterns` configuration field from the Settings page (`options.html`).
- The underlying `chrome.storage.sync` logic for `hostPatterns` will remain intact so it can be managed Programmatically or left unused.

## Capabilities

### New Capabilities
- None.

### Modified Capabilities
- `options-page-module`: The `hostPatterns` field will be removed from the visible UI but remains within the configuration schema.

## Impact

- **UI**: The General Settings tab in `options.html` will no longer display the Host Patterns field.
- **Config**: `options.js` must still cleanly handle saving/loading the hidden `hostPatterns` value so it isn't erased when the user saves other settings.
