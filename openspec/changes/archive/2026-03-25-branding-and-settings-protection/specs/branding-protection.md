# Spec: Branding & API Protection

## Đổi tên

- Mọi nơi user nhìn thấy "Open Notebook AI" → "ChatBot - HNA Soft"
- Loading: "Đang hỏi ChatBot…"
- Error prefix: "ChatBot Error:"
- Màu và icon có thể đổi: 📓 → 🤖

## Ẩn API credentials

- 3 field (API URL, Notebook ID, API Password) KHÔNG hiển thị trong Settings
- Giá trị luôn lấy từ `config.json` (bundled trong extension package)
- Chỉ developer có source code mới sửa được `config.json`
- User cuối không biết endpoint, ID, hoặc password

## Ràng buộc

- Dropdown "Chế độ Session" vẫn hiển thị bình thường
- Host Patterns vẫn editable bởi user
- `config.json` vẫn nằm trong extension folder — bất kỳ ai có CRX đều đọc được, nhưng đủ để ngăn user thông thường
