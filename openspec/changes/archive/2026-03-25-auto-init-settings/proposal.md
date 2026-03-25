# Auto-Init Settings

## What
Tự động nạp cài đặt từ `config.json` vào `chrome.storage.sync` khi cài extension lần đầu, không cần user vào Settings nhấn Lưu.

## Tasks
- [x] Sửa `background.js` onInstalled: load config.json → write defaults to chrome.storage.sync
