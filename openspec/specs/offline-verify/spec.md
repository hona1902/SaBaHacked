# Capability: Offline Verify

### Requirement: Generate Machine Code
The system SHALL generate a unique 8-character uppercase hex machine code from the browser fingerprint SHA-256 hash. This code SHALL be displayed in the Settings "Bản quyền" section for the user to copy.

#### Scenario: Machine code displayed on settings load
- **WHEN** user opens the Settings page
- **THEN** the "Mã máy" field SHALL display an 8-character uppercase hex string derived from the first 8 characters of the SHA-256 fingerprint

#### Scenario: Machine code is copyable
- **WHEN** user clicks the copy button next to the machine code
- **THEN** the machine code SHALL be copied to the clipboard

### Requirement: Offline License Key Verification
The system SHALL verify license keys locally using HMAC-SHA256. The key is valid when the first 16 uppercase hex characters of `HMAC-SHA256(machineCode, SECRET_KEY)` match the user-provided key (case-insensitive comparison).

#### Scenario: Valid license key entered
- **WHEN** user enters a valid 16-character license key matching `HMAC-SHA256(machineCode, secret)[0:16].toUpperCase()`
- **THEN** the system SHALL store the key in `chrome.storage.sync`, display "✓ Đã kích hoạt", and unlock AI features

#### Scenario: Invalid license key entered
- **WHEN** user enters a key that does NOT match the expected HMAC output
- **THEN** the system SHALL display "✗ Key không hợp lệ" and AI features SHALL remain locked

#### Scenario: No license key stored
- **WHEN** no license key exists in `chrome.storage.sync`
- **THEN** AI features SHALL be locked and the popup SHALL show "Chưa kích hoạt"

### Requirement: License verification without network
The system SHALL NOT make any network requests during license verification. All verification logic MUST execute locally using Web Crypto API.

#### Scenario: Verify works offline
- **WHEN** the device has no internet connection and a valid key is stored
- **THEN** license verification SHALL succeed and AI features SHALL be unlocked
