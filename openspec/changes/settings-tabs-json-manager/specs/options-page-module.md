# Spec: Options Page Module

## API / Interface

### Tab System
```
switchTab(tabId: 'general' | 'bank') → void
```
- Toggles `.tab-btn.active` and `.tab-panel.active`
- Stores active tab in `sessionStorage.setItem('activeTab', tabId)`

### General Tab (existing)
```
loadGeneralSettings() → void   // read from chrome.storage.sync → populate fields
saveGeneralSettings() → void   // read fields → write to chrome.storage.sync
```

### Bank Management Tab
```
loadBankList() → void            // read localBankFiles + chrome.storage.local → render list
createBank(name: string) → void  // create empty bank in chrome.storage.local, update localBankFiles
deleteBank(name: string) → void  // remove from chrome.storage.local + localBankFiles
toggleBank(name: string) → void  // enable/disable bank file in localBankFiles list
```

### Question CRUD
```
addQuestion(bankName, { question, options, answer, explanation }) → void
importQuestions(bankName, jsonArray) → void  // bulk import from pasted JSON
getQuestionCount(bankName) → number
```

### Storage Keys
| Key | Storage | Format |
|-----|---------|--------|
| `endpoint` | sync | string |
| `apiKey` | sync | string |
| `hostPatterns` | sync | string |
| `localBankFiles` | sync | string (comma-separated paths) |
| `questionBanks` | local | `{ [bankName]: Question[] }` |

### Question Schema
```json
{
  "question": "string (required)",
  "options": { "A": "string", "B": "string", "C": "string", "D": "string" },
  "answer": "A|B|C|D (required)",
  "explanation": "string (optional)"
}
```

## answer-bank.js Update
- `loadAnswerBank(filePaths)` must also check `chrome.storage.local.questionBanks[name]`
- For bundled files: fetch via `chrome.runtime.getURL`
- For user-created banks: read from `chrome.storage.local`
- Identification: if path doesn't start with `data/` or file fetch fails → try storage
