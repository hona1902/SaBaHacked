# Option-Aware Best Match Selection

## What

Change the best-match selection in `findLocalAnswer()` to consider **both question similarity AND option similarity** when picking the primary result, instead of question similarity alone.

## Why

When multiple bank entries have similar questions (e.g. same topic, different wording), the current logic picks purely by question text similarity. But the correct match should be the one whose options (A/B/C/D) also match the page options. A bank entry with 85% question match but 100% option match is more likely correct than one with 90% question match but 50% option match.

## Scope

- **File**: `answer-bank.js` — `findLocalAnswer()` function
- Compute option similarity score for each candidate match
- Use combined score (question + options) to select best match
- No UI changes needed — the display already uses the result object
