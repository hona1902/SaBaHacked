# Design: Excel Template Download

## Approach

Sử dụng SheetJS (đã bundle sẵn trong `lib/xlsx.full.min.js`) để tạo file Excel in-memory và trigger download.

### Template Content

File mẫu sẽ có:
- **Header row**: Câu hỏi | A | B | C | D | Đáp án | Giải thích
- **2 sample rows**: Câu hỏi mẫu với đầy đủ dữ liệu để user hiểu format
- **Column widths**: set rộng cho dễ nhìn

### Implementation

```js
function downloadTemplate() {
  const data = [
    ['Câu hỏi', 'A', 'B', 'C', 'D', 'Đáp án', 'Giải thích'],
    ['Ngân hàng nào lớn nhất Việt Nam?', 'Vietcombank', 'Agribank', 'BIDV', 'Techcombank', 'B', 'Agribank có tổng tài sản lớn nhất'],
    ['HTML là viết tắt của?', 'Hyper Text Markup Language', 'High Tech ML', 'Home Tool ML', 'None', 'A', '']
  ];
  // XLSX.utils.aoa_to_sheet → workbook → XLSX.writeFile
}
```

### UI

Thêm một link/button nhỏ ngay bên dưới hướng dẫn format Excel:
```
📋 Format Excel: Cột 1=Câu hỏi...
📥 Tải file mẫu Excel
```
