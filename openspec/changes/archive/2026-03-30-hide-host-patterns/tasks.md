## 1. UI Updates

- [x] 1.1 In `options.html`, locate the `<div class="field">` containing the `hostPatterns` textarea.
- [x] 1.2 Add the inline style `style="display: none;"` to this `<div class="field">`.

## 2. Verification

- [x] 2.1 Open the Extension Settings page and verify that "Host Patterns" is no longer visible.
- [x] 2.2 Attempt to save settings (e.g. Session Mode) and verify that `hostPatterns` is not erased from `chrome.storage.sync`.
