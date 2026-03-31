## MODIFIED Requirements

### Requirement: Bank Files Retrieval with Initialization Guard
The system SHALL use a `bankFilesInitialized` flag in `chrome.storage.sync` to distinguish between first-use state (show default bundled banks) and user-modified state (use exact saved list, even if empty).

When `bankFilesInitialized` is `false` or `undefined`, `getBankFiles()` SHALL return the default bundled bank list (`data/cong-nghe-so.json`).

When `bankFilesInitialized` is `true`, `getBankFiles()` SHALL return exactly the value stored in `localBankFiles`, including returning an empty array if no banks remain.

#### Scenario: First-time user sees default bundled bank
- **WHEN** user opens settings for the first time (no `bankFilesInitialized` flag exists)
- **THEN** the system displays the default bundled bank `data/cong-nghe-so.json` in the bank list

#### Scenario: User deletes the only bundled bank
- **WHEN** user deletes the bundled bank `data/cong-nghe-so.json` and confirms
- **THEN** the system sets `bankFilesInitialized` to `true`
- **AND** the system removes the bank from `localBankFiles`
- **AND** the bank list becomes empty
- **AND** the bank does NOT reappear on page reload or tab switch

#### Scenario: User creates a new bank after deleting all banks
- **WHEN** user creates a new custom bank after all banks were deleted
- **THEN** the system sets `bankFilesInitialized` to `true`
- **AND** the new bank appears in the list
- **AND** no bundled bank is re-injected

## ADDED Requirements

### Requirement: Delete Bank Persistence for Bundled Banks
The system SHALL persist the deletion of bundled banks across page reloads, tab switches, and extension restarts. When a bundled bank is deleted, the `deleteBank()` function MUST set `bankFilesInitialized = true` alongside removing the bank from `localBankFiles`.

#### Scenario: Bundled bank stays deleted after reload
- **WHEN** user deletes the bundled bank and reloads the settings page
- **THEN** the bundled bank is NOT shown in the bank list
- **AND** `bankFilesInitialized` is `true` in `chrome.storage.sync`
