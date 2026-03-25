# Design: Fix Local Answer Highlight

## Root Cause

In `popup.js`, function `renderLocalResult()`, line ~591:

```javascript
const isCorrect = l.toUpperCase() === result.mappedAnswer;
```

`result.mappedAnswer` is the answer letter mapped to the **page's shuffled order** (e.g., C on the page). But the bank options (A/B/C/D) are displayed in bank order. So when we highlight "which bank option is correct," we should compare against `result.originalAnswer` (the bank's own answer letter, e.g., B).

## Fix

Change line 591 from:
```javascript
const isCorrect = l.toUpperCase() === result.mappedAnswer;
```
to:
```javascript
const isCorrect = l.toUpperCase() === result.originalAnswer;
```

This ensures bank options are highlighted based on the bank's own correct answer letter, not the shuffled page letter.

## No Other Changes Needed

- The **allMatches** section (line 625) already correctly uses `m.answerLetter` (original bank letter) — no fix needed.
- The **main answer display** (line 570) correctly shows `mappedAnswer` which is what the user should click on the page — no fix needed.
- The **mapping info** line (574) correctly shows original → mapped — no fix needed.
