# Settings Tabs & JSON Manager

## What

Redesign the Settings page (`options.html`) to use a **2-tab layout**:

1. **Tab "Cài đặt chung"** — Giữ nguyên các trường hiện tại (endpoint, API key, host patterns)
2. **Tab "Ngân hàng câu hỏi"** — Quản lý file JSON question bank:
   - Danh sách các file JSON đã có trong `data/`
   - Form tạo file JSON mới (nhập tên file, thêm từng câu hỏi)
   - Xoá file / xem nội dung file
   - Trường `localBankFiles` để chọn file nào được dùng khi matching

## Why

- Hiện tại Settings không có UI để quản lý đường dẫn `localBankFiles` — người dùng phải sửa code
- Không có cách nào tạo/quản lý file JSON question bank từ giao diện extension
- Cần UI trực quan để thêm câu hỏi mới vào ngân hàng mà không cần mở JSON editor

## Context

- Extension hiện dùng `chrome.storage.sync` để lưu config
- File JSON question bank nằm trong `data/*.json`, được đăng ký qua `web_accessible_resources` trong manifest
- Module `answer-bank.js` đã load và match từ các file này
- Settings page hiện tại rất đơn giản (1 trang, inline CSS)
