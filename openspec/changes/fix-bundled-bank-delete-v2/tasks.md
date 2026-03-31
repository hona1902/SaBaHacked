## 1. Sửa `deleteBank()` — xóa storage cho mọi bank

- [x] 1.1 Bỏ guard `if (!isBundled)` — luôn xóa key từ `questionBanks` storage cho cả bundled và custom

## 2. Sửa `loadBankList()` — chỉ hiện bank active

- [x] 2.1 Bỏ merge ALL keys từ `questionBanks` vào `allBanks`. Chỉ dùng `files` (từ `getBankFiles()`) làm source of truth cho danh sách hiển thị.

## 3. Kiểm tra

- [x] 3.1 Xóa bundled bank → reload → bank KHÔNG xuất hiện lại
- [x] 3.2 Tạo custom bank → import data → xóa → bank không xuất hiện lại
