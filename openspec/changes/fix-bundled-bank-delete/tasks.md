## 1. Sửa `getBankFiles()` — thêm initialization guard

- [x] 1.1 Thêm đọc flag `bankFilesInitialized` từ `chrome.storage.sync` trong hàm `getBankFiles()`
- [x] 1.2 Khi `bankFilesInitialized === true`, trả về chính xác giá trị `localBankFiles` đã lưu (kể cả rỗng — trả về mảng rỗng `[]`)
- [x] 1.3 Khi `bankFilesInitialized` là `false` hoặc `undefined`, giữ hành vi cũ — dùng default `'data/cong-nghe-so.json'`

## 2. Sửa `deleteBank()` — set flag khi xóa

- [x] 2.1 Trong hàm `deleteBank()`, thêm `await chrome.storage.sync.set({ bankFilesInitialized: true })` sau khi lưu danh sách bank mới

## 3. Sửa `createBank()` — set flag khi tạo

- [x] 3.1 Trong event handler của nút "createBank", thêm set flag `bankFilesInitialized: true` khi tạo bank mới

## 4. Kiểm tra thủ công

- [x] 4.1 Xóa bundled bank `data/cong-nghe-so.json` → confirm → reload trang → bank KHÔNG xuất hiện lại
- [x] 4.2 Tạo bank custom mới → xóa bank custom → bank không xuất hiện lại
- [x] 4.3 Fresh install (xóa extension data) → bundled bank vẫn hiện mặc định ban đầu

## 5. Bonus: Sửa popup.js (phát hiện thêm)

- [x] 5.1 popup.js cũng có cùng default value hardcoded — đã sửa đồng bộ với options.js
