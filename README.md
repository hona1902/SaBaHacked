# RAG Assist (n8n) — Safe Mode

Chrome Extension (Manifest V3) hỗ trợ tra cứu RAG qua n8n và gợi ý phương án kèm trích dẫn **không tự động click/submit**.

## Cấu hình
1. Mở `chrome://extensions/` → bật **Developer mode** → **Load unpacked** → chọn thư mục này.
2. Mở **Options** của extension:
   - `n8n RAG Endpoint (POST)`: ví dụ `https://YOUR-N8N-DOMAIN/webhook/rag-qa`
   - `API Key / Token`: nếu webhook yêu cầu
   - `Allowed Host Patterns`: regex các domain cho phép (mỗi dòng một mẫu)
3. Trên trang bài tập:
   - Bôi đen câu hỏi → **Use selection**
   - **Get options from page** để thu thập phương án
   - **Ask n8n RAG** → xem `Best answer`, `Options ranking`, `Citations`
   - **Highlight** tự động (từ popup hoặc tự động khi có kết quả)

## Ghi chú
- Đây là bản an toàn (safe mode) phục vụ đào tạo: không tự động chọn đáp án/submit.
- Hãy triển khai n8n workflow trả JSON schema: `{answer, options_ranking:[{option_text,score}], citations:[...]}`.

