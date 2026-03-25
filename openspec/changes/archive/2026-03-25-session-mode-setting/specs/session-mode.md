# Spec: Session Mode Setting

## Yêu cầu

1. Setting mới `sessionMode` trong trang Cài đặt chung, dưới phần "Open Notebook":
   - Dropdown với 2 lựa chọn:
     - `"new"` — "Mỗi câu hỏi tạo session mới"
     - `"reuse"` — "Dùng 1 session cho tất cả câu hỏi"
   - Mặc định: `"new"`

2. Khi `sessionMode = "reuse"`:
   - Lưu `currentSessionId` vào `chrome.storage.local`
   - Tái sử dụng session đã lưu cho các câu hỏi tiếp theo
   - Nếu session hết hạn/lỗi → tự động tạo mới

3. Khi `sessionMode = "new"`:
   - Hành vi hiện tại, không thay đổi

## Ràng buộc

- Không ảnh hưởng đến local matching (chỉ áp dụng khi gọi AI)
- Session được lưu per-browser (chrome.storage.local), mỗi máy/browser có session riêng
- Khi đổi notebookId → reset session cũ
