# Fix Shuffled Answer Mapping

## What
Khi đề thi đảo thứ tự ABCD, hệ thống dò trúng câu hỏi nhưng trả đáp án gốc (letter từ bank) thay vì letter đã ánh xạ sang đề thi thực tế.

## Root Cause
1. `answer-bank.js`: chỉ so sánh nội dung đáp án đúng với page options, nếu similarity < threshold thì fallback về letter gốc
2. `content.js`: `ANNOTATE_RANKING` nhận `answer` field nhưng không dùng → không highlight đáp án trên trang

## Fix
1. **`answer-bank.js`**: So sánh TẤT CẢ 4 option bank vs TẤT CẢ 4 option trang → tìm mapping hoàn chỉnh → ánh xạ chính xác letter
2. **`content.js`**: Xử lý `msg.answer` để highlight đúng option trên trang quiz
