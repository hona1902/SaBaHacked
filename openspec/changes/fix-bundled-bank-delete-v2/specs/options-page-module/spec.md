## MODIFIED Requirements

### Requirement: Delete Bank removes all traces
The system SHALL remove bank data from BOTH `localBankFiles` (sync) AND `questionBanks` (local) when deleting any bank, regardless of whether it is bundled or custom.

#### Scenario: Delete bundled bank with imported data
- **WHEN** user deletes the bundled bank `data/cong-nghe-so.json` that has imported data in questionBanks
- **THEN** the system removes it from `localBankFiles`
- **AND** the system deletes the key from `questionBanks` storage
- **AND** the bank does NOT reappear on reload

### Requirement: Bank list only shows active banks
The system SHALL display ONLY banks that are in the active `localBankFiles` list. Banks that have orphaned data in `questionBanks` storage but are NOT in `localBankFiles` SHALL NOT be displayed.

#### Scenario: Orphaned storage key after deletion
- **WHEN** `questionBanks` contains key `data/cong-nghe-so.json` but `localBankFiles` does not
- **THEN** the bank is NOT shown in the bank list
