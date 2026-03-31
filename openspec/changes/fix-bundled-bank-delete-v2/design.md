## Context

Trong `loadBankList()`, bank list được xây dựng bằng cách merge 2 nguồn:
1. `files` = danh sách active từ `localBankFiles` (sync storage)
2. `Object.keys(banks)` = tất cả key từ `questionBanks` (local storage)

Khi user import data Excel vào bundled bank, key `data/cong-nghe-so.json` được tạo trong `questionBanks`. Sao đó khi xóa bank, `deleteBank()` bỏ qua cleanup cho bundled bank → key vẫn tồn tại → `loadBankList()` merge nó lại → bank xuất hiện lại.

## Goals / Non-Goals

**Goals:**
- Xóa bank bundled thành công, không tái xuất hiện  
- Giữ backward compatible cho user chưa từng thao tác

**Non-Goals:**
- Thay đổi cấu trúc storage

## Decisions

### Decision 1: Bỏ guard `if (!isBundled)` trong deleteBank

Khi xóa bank, **luôn xóa** key khỏi `questionBanks` storage bất kể bundled hay custom. Lý do: nếu user đã import data vào bundled bank, key đó tồn tại trong storage và cần được cleanup.

### Decision 2: Sửa merge logic trong loadBankList

Thay vì merge ALL keys từ `questionBanks`, chỉ merge key mà **cũng tồn tại trong `files` list**. Loại bỏ logic auto-add bank chỉ vì nó có data.

**Tại sao?** Không nên hiển thị bank mà user đã xóa chỉ vì data còn sót trong storage. Danh sách `files` (từ `localBankFiles`) mới là "source of truth" cho bank nào đang active.

## Risks / Trade-offs

- **Risk**: Nếu có data trong `questionBanks` nhưng bank không có trong `files`, data sẽ bị orphaned (không hiển thị). → **Chấp nhận**: đây là hệ quả mong muốn khi user xóa bank.
