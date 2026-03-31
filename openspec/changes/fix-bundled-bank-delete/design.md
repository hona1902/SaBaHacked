## Context

Trong extension SabaHacked, ngân hàng câu hỏi được quản lý bởi `options.js`. Có 2 loại bank:

1. **Bundled bank**: File JSON đóng gói sẵn trong extension (ví dụ `data/cong-nghe-so.json`), được nhận diện bởi hàm `isBundledFile()`.
2. **Custom bank**: Do user tạo, lưu trong `chrome.storage.local` (key `questionBanks`).

Danh sách bank files active được lưu trong `chrome.storage.sync` với key `localBankFiles`. Hàm `getBankFiles()` đọc giá trị này với **default value** là `'data/cong-nghe-so.json'`:

```js
const { localBankFiles } = await chrome.storage.sync.get({ localBankFiles: 'data/cong-nghe-so.json' });
```

**Vấn đề**: Khi user xóa bundled bank duy nhất, `localBankFiles` được lưu thành chuỗi rỗng `""`. Lần đọc tiếp theo, `chrome.storage.sync.get()` nhận thấy value là rỗng và trả về default `'data/cong-nghe-so.json'` → bank "sống lại".

## Goals / Non-Goals

**Goals:**
- Cho phép xóa bundled bank và nó sẽ không tự xuất hiện lại
- Giữ nguyên hành vi hiện tại cho custom banks
- Backward compatible: user cũ (chưa bao giờ chỉnh bank) vẫn thấy bundled bank mặc định

**Non-Goals:**
- Không thay đổi cấu trúc JSON của question data
- Không thay đổi logic matching trong `answer-bank.js`
- Không thêm tính năng "restore bundled bank"

## Decisions

### Decision 1: Dùng flag `bankFilesInitialized` thay vì thay đổi default value

**Cách tiếp cận**: Thêm một flag boolean `bankFilesInitialized` vào `chrome.storage.sync`. 

- Khi `bankFilesInitialized === false` (hoặc undefined): lần đầu sử dụng → dùng default bundled list
- Khi `bankFilesInitialized === true`: user đã tương tác → dùng chính xác giá trị `localBankFiles` đã lưu, kể cả rỗng

**Tại sao không dùng cách khác?**
- **Option B**: Lưu `localBankFiles` thành chuỗi đặc biệt `"__EMPTY__"` thay vì rỗng → hacky, dễ gây bug
- **Option C**: Luôn lưu danh sách đầy đủ kể cả bundled → mất khả năng thêm bundled bank mới trong update

**Chọn Option A** vì clear intent, backward compatible, dễ hiểu.

### Decision 2: Set `bankFilesInitialized = true` khi nào?

Set flag khi user thực hiện bất kỳ thao tác nào thay đổi danh sách bank:
- Xóa bank (deleteBank)
- Tạo bank mới (createBank)

Đảm bảo sau khi user chủ động thay đổi, hệ thống không tự ý thêm lại bank bundled.

## Risks / Trade-offs

- **Risk**: User cũ upgrade extension, flag chưa tồn tại → `getBankFiles()` vẫn trả về default bundled bank → **Đây là hành vi mong muốn** (backward compatible).
- **Risk**: Nếu sau này thêm bundled bank mới, user cũ (đã initialized) không thấy bank mới → **Chấp nhận**, vì user đã chủ động quản lý danh sách.
