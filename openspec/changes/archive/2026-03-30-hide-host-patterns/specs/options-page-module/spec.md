## ADDED Requirements

### Requirement: Host Patterns Configuration
The system SHALL retain the `hostPatterns` configuration capability within the user's synchronization storage (`chrome.storage.sync`) and enforce it at runtime, but the system MUST NOT display the `hostPatterns` editing UI on the settings page (`options.html`).

#### Scenario: User visits settings page
- **WHEN** user opens the extension settings
- **THEN** the Host Patterns input field and its description text are hidden from view.
- **AND** the underlying configuration value in `chrome.storage.sync` remains intact and active.
