## Context

Currently, the SabaHacked extension has an options page (`options.html`) which allows the user to specify `hostPatterns` — a newline-separated list of regexes that restrict which websites the extension can run on. The client wants to stop displaying this configuration box in the settings panel to avoid clutter and prevent users from accidentally altering or breaking the highlight rules.

## Goals / Non-Goals

**Goals:**
- Hide the "Host Patterns (regex, mỗi dòng 1 mẫu)" section from `options.html`.
- Maintain the underlying `hostPatterns` feature in the extension so it continues to function the same way in `popup.js` (using values saved in Chrome Storage).

**Non-Goals:**
- Completely hardcoding the host patterns in JS (the `chrome.storage` mechanism stays so admins can still update it programmatically or via backend if ever needed).
- Altering the domain isolation logic in `popup.js` or `content.js`.

## Decisions

- **Hide via CSS**: Instead of removing the `hostPatterns` logic from the Javascript, the simplest and least breaking change is to add `style="display: none;"` to the container `<div class="field">` and related text. This ensures that `document.getElementById('hostPatterns')` still exists and the form logic in `options.js` won't crash when it goes to save settings.
  
*Alternatives considered*: 
- Deleting the `textarea` and ignoring `hostPatterns` entirely from `options.js` saving process. This could result in the key being overwritten or lost if not handled properly. Hiding but keeping the element in the DOM ensures backward compatibility with zero logic changes.

## Risks / Trade-offs

- **Risk:** Users will not have a GUI to edit the host patterns if they need to.
- **Mitigation:** The requirement intentionally removes this capability for average users. If a change is needed later, the CSS `display: none;` can be quickly reverted by an admin or the value can be populated through a company deployment policy.
