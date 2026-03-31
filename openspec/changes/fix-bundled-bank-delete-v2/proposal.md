## Why

Fix v1 (`bankFilesInitialized` flag) không giải quyết hết bug. Bank bundled vẫn "sống lại" sau khi xóa vì **2 nguyên nhân gốc thực sự**:

1. **`loadBankList()` merge tất cả key từ `questionBanks` storage** (line 241-243) — ngay cả khi bank đã bị xóa khỏi `localBankFiles`, nó vẫn xuất hiện lại nếu key tồn tại trong `chrome.storage.local.questionBanks`.
2. **`deleteBank()` bỏ qua cleanup storage cho bundled banks** — điều kiện `if (!isBundled)` ngăn không cho xóa key trong `questionBanks` storage khi bank là bundled.

## What Changes

- **Sửa `deleteBank()`**: Xóa key trong `questionBanks` storage cho **TẤT CẢ** bank (kể cả bundled), bỏ guard `if (!isBundled)`.
- **Sửa `loadBankList()`**: Chỉ merge key từ `questionBanks` storage nếu key đó **cũng có trong `files` list** (tức là active). Không auto-add bank chỉ vì nó có data trong storage.

## Capabilities

### New Capabilities
_(Không có)_

### Modified Capabilities
- `options-page-module`: Sửa logic merge bank list và cleanup khi xóa bank

## Impact

- **File**: `options.js` — `deleteBank()` và `loadBankList()`
- **Không ảnh hưởng**: popup.js, answer-bank.js — chỉ đọc theo danh sách được truyền
