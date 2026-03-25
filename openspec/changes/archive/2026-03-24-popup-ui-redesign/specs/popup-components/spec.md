# Spec: Popup UI Components

## Header
- Solid `#AE1C3F` background, white text
- Title: "Saba Hacked v1.1.0 — by HNA Soft" 
- Settings + Refresh buttons positioned right, icon-only, white SVG icons

## Selectors
- Business dropdown: full-width, with "Nghiệp vụ" label left-aligned
- Tab dropdown: full-width, with "Tab" label
- Both: `#AE1C3F` focus ring, rounded borders

## Textarea
- Placeholder: "Nhập hoặc paste câu hỏi..."
- `#AE1C3F` focus border with light glow
- Rounded corners, subtle border

## Action Buttons
- **Lấy dữ liệu**: Primary filled, SVG search icon, `#AE1C3F` bg
- **Tìm đáp án**: Outlined, SVG sparkle icon, `#AE1C3F` border
- Both: transition hover, flex basis 50%

## Hidden Buttons
- `#captureScreen`, `#openAsTabInline`: Add `display:none` or remove from DOM
- Keep JS handlers intact (no breaking changes)

## Results Area
- `#F8F9FA` background, rounded, subtle border
- Max height 50vh with scroll
- `.opt` items: left `#AE1C3F` border accent

## Warning Footer
- Smaller text, `#6B7280` color, centered
- Subtle top border separator
