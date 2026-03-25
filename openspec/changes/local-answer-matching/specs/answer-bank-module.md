# Spec: Answer Bank Module

## Overview
Module `answer-bank.js` cung cấp API để load ngân hàng câu hỏi từ JSON files bundled cùng extension và dò đáp án bằng text similarity.

## API

### `loadAnswerBank(filePaths: string[]): Promise<QuestionEntry[]>`
Load và merge nhiều file JSON ngân hàng câu hỏi.
- Input: mảng đường dẫn tương đối tới các file JSON trong extension
- Output: mảng `QuestionEntry`
- Caching: cache sau lần load đầu tiên, chỉ reload khi gọi lại

### `findLocalAnswer(question: string, pageOptions: string[], bank: QuestionEntry[]): MatchResult | null`
Tìm câu hỏi khớp nhất trong ngân hàng và map đáp án theo thứ tự trên đề.
- Input:
  - `question`: text câu hỏi đã normalize  
  - `pageOptions`: mảng text các đáp án trên đề (đã extract từ DOM)
  - `bank`: ngân hàng câu hỏi đã load
- Output: `MatchResult` nếu score ≥ threshold, `null` nếu không tìm thấy

## Data Types

```typescript
interface QuestionEntry {
  question: string;
  options: { A: string; B: string; C: string; D: string };
  answer: string;       // "A" | "B" | "C" | "D"
  explanation?: string;
}

interface MatchResult {
  matchedQuestion: string;           // Câu hỏi trong DB
  questionScore: number;             // Similarity score (0-1)
  originalAnswer: string;            // Đáp án gốc trong DB (A/B/C/D)
  originalAnswerText: string;        // Text đáp án gốc
  mappedAnswer: string;              // Đáp án đã map sang thứ tự trên đề
  mappedAnswerText: string;          // Text đáp án sau map
  optionMappingScore: number;        // Score khi map option
  explanation?: string;
}
```

## Matching Algorithm

1. **Normalize**: `text → lowercase → bỏ dấu (NFD + strip combining) → bỏ ký tự đặc biệt → collapse spaces`
2. **Stage 1 - Exact match**: `normalize(question) === normalize(entry.question)` → score = 1.0
3. **Stage 2 - Substring**: `normalize(question).includes(normalize(entry.question))` hoặc ngược lại → score = 0.95
4. **Stage 3 - Jaccard**: `|words(A) ∩ words(B)| / |words(A) ∪ words(B)|`
5. Chọn entry có score cao nhất, chỉ accept nếu ≥ `QUESTION_MATCH_THRESHOLD` (0.65)

## Option Mapping Algorithm

1. Lấy `answerText = entry.options[entry.answer]`
2. Với mỗi `pageOption[i]`, tính `sim(answerText, pageOption[i])` bằng Jaccard
3. Chọn `i` có score cao nhất, chỉ accept nếu ≥ `OPTION_MAP_THRESHOLD` (0.55)
4. Nếu match → `mappedAnswer = ['A','B','C','D'][i]`
5. Nếu không match → fallback về `originalAnswer`
