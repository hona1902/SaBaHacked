# Design: Option-Aware Best Match Selection

## Current Flow

1. Score all bank entries by `textSimilarity(question, entry.question)`
2. Sort by question score, pick top-1
3. Map options only for that single best match

## New Flow

1. Score all bank entries by question similarity (same as now)
2. **For each candidate above threshold**, compute an option similarity score against page options
3. Compute a **combined score** = `0.5 * questionScore + 0.5 * optionScore`
4. Re-sort by combined score, pick the true best match
5. Map options for that match (same as now)

## Option Similarity Calculation

For a given bank entry and page options:
- For each bank option (A, B, C, D), find the best `textSimilarity()` match in page options
- Average the best match scores across all bank options
- This gives a 0-1 score representing how well the bank options align with page options

```javascript
function computeOptionSimilarity(bankOptions, pageOptions) {
  const bankLetters = Object.keys(bankOptions).filter(k => /^[A-F]$/i.test(k));
  if (!bankLetters.length || !pageOptions.length) return 0;
  
  let totalScore = 0;
  for (const bl of bankLetters) {
    const bankText = bankOptions[bl] || '';
    if (!bankText) continue;
    let bestScore = 0;
    for (const pageText of pageOptions) {
      bestScore = Math.max(bestScore, textSimilarity(bankText, pageText));
    }
    totalScore += bestScore;
  }
  return totalScore / bankLetters.length;
}
```

## Weight Tuning

- When page options are available: `combined = 0.5 * questionScore + 0.5 * optionScore`
- When NO page options: fall back to question score only (same as current behavior)

## Edge Cases

- If pageOptions is empty (user didn't pull from page), fall back to question-only ranking
- If a bank entry has no options, its optionScore = 0
