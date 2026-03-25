# Design: Fix Answer Mapping

## Current Algorithm (Broken)

```
For each bank option letter (A, B, C, D):
  Find the page option with highest similarity → bankToPage[letter]
Look up bankToPage[correctAnswer] → mappedIdx
```

**Problem**: Bank options A and C might both independently find the same best-matching page option (e.g., page index 0), because the texts overlap heavily. No constraint prevents this collision.

## New Algorithm: Greedy 1:1 Bipartite Matching

```
1. Build full similarity matrix: bankOptions × pageOptions
2. Flatten into scored pairs: [(bankLetter, pageIdx, score), ...]
3. Sort descending by score
4. Greedily assign: take highest-scoring pair, remove both from available pools
5. Repeat until all bank options are mapped
6. Look up correctAnswer's mapped page index
```

This guarantees each bank option maps to a **unique** page option, resolving collisions by priority (highest similarity wins).

## Why Greedy Instead of Hungarian Algorithm

- Only 4-6 options max → greedy is simple, fast, and nearly optimal
- No external dependencies needed
- Easy to debug via console logs

## File Changes

### `answer-bank.js`
- Replace lines 185-206 (the independent best-match loop) with the greedy 1:1 matcher
- Keep all existing similarity functions, thresholds, and logging patterns
- Add validation: if any mapping score < OPTION_MAP_THRESHOLD, skip that assignment

## Edge Cases

1. **Fewer page options than bank options**: Some bank options won't map — acceptable
2. **More page options than bank options**: Extra page options ignored
3. **All options identical text**: Greedy assigns in order — same as original but at least 1:1
4. **No page options**: Falls back to original answer letter (existing behavior, unchanged)
