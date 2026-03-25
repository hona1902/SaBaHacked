## Tasks

### Phase 1: Khảo sát DOM thực tế
- [ ] T1: Đăng nhập elearning.agribank.com.vn, khởi chạy "Thi thử nghiệp vụ chi nhánh", và khảo sát DOM cửa sổ popup bài thi
- [ ] T2: Xác nhận selectors hiện tại (`.scp-qtext`, `qrespb.*`, `.scp-dbtntxt label`) có hoạt động hay cần bổ sung

### Phase 2: Cập nhật content script
- [ ] T3: Cập nhật selectors trong `content.js` nếu cần, dựa trên DOM thực tế
- [ ] T4: Đảm bảo fallback extraction (executeScript all frames) hoạt động trong popup window

### Phase 3: Cải thiện popup
- [ ] T5: Đảm bảo tab picker hiển thị cửa sổ popup mới một cách chính xác
- [ ] T6: Cải thiện format output trong textarea (câu hỏi + A/B/C/D)

### Phase 4: Kiểm thử
- [ ] T7: Test end-to-end: đăng nhập → khởi chạy bài thi → chọn tab → lấy dữ liệu → verify output
