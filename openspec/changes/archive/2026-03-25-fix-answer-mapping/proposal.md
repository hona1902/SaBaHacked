# Fix Answer Mapping When Options Are Shuffled

## What

Fix the answer mapping logic in `answer-bank.js` so that when the quiz platform shuffles the order of A/B/C/D options, the extension correctly maps the original correct answer to the new position on the page.

## Why

Currently, when a user encounters a quiz with shuffled options (e.g., the correct answer from bank position A is now displayed at position C on the page), the extension still shows "Đáp án: A" instead of "Đáp án: C". This makes the extension unreliable for the core use case.

**Root Cause**: The `bankToPage` mapping in `findLocalAnswer()` uses independent best-match per bank option — each bank option finds its highest-scoring page option independently. This causes two problems:

1. **No 1:1 enforcement**: Multiple bank options can map to the same page option when texts are similar
2. **Greedy collision**: With highly similar options (e.g., "giá trị tối thiểu" vs "giá trị tối đa"), the Jaccard word similarity scores are nearly identical, causing the wrong page index to win

## Scope

- `answer-bank.js`: Replace the independent best-match mapping with a greedy 1:1 bipartite matching algorithm
- No changes to data format, UI, or other modules
