# Design: Popup UI Redesign

## Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `--primary` | `#AE1C3F` | Buttons, header, accents |
| `--primary-hover` | `#8E1533` | Hover states |
| `--primary-light` | `#FBE8EC` | Light backgrounds, badges |
| `--bg` | `#FFFFFF` | Page background |
| `--surface` | `#F8F9FA` | Card/result backgrounds |
| `--border` | `#E5E7EB` | Borders, dividers |
| `--text` | `#1F2937` | Body text |
| `--text-muted` | `#6B7280` | Secondary text |

### Typography
- **Font**: `Inter, system-ui, -apple-system, sans-serif`
- **Size**: 13px base body, 11px labels, 15px header title
- **Weight**: 400 body, 500 labels, 600 buttons, 700 header

### Spacing & Radius
- Padding: 16px body, 10px–12px components
- Border radius: 8px cards, 6px buttons/inputs, 12px results
- Gap: 8px between row items

### Shadows
- Cards: `0 1px 3px rgba(0,0,0,0.08)`
- Header: `0 2px 8px rgba(174,28,63,0.15)`
- Buttons hover: `0 2px 8px rgba(174,28,63,0.2)`

## Layout

```
┌──────────────────────────────────┐
│  ■ Saba Hacked v1.1.0      ⚙ 🔄│  ← Header bar (#AE1C3F bg)
├──────────────────────────────────┤
│  Nghiệp vụ: [dropdown ▾]       │  ← Business picker
│  Tab:       [dropdown ▾]       │  ← Tab picker
├──────────────────────────────────┤
│  ┌────────────────────────────┐ │
│  │ Câu hỏi...                │ │  ← Textarea
│  └────────────────────────────┘ │
│  [ ◉ Lấy dữ liệu ] [◎ Tìm đáp│ │  ← Action buttons
├──────────────────────────────────┤
│  Kết quả hiển thị ở đây...     │  ← Results area
├──────────────────────────────────┤
│  ⚠ Dùng vui thôi nhé!          │  ← Footer warning
└──────────────────────────────────┘
```

## Button Styles
- **Primary** (Lấy dữ liệu): `bg: #AE1C3F`, white text, filled
- **Secondary** (Tìm đáp án): white bg, `#AE1C3F` border + text, outlined
- **Icon buttons** (Settings, Refresh): transparent bg, `#AE1C3F` icon color on hover

## Hidden Elements
- `#captureScreen` button → `display: none`
- `#openAsTabInline` button → `display: none`

## SVG Icons (inline)
- Settings gear: `<svg>` path for gear icon
- Refresh: `<svg>` path for refresh/reload icon
- Search: `<svg>` path for search icon (Lấy dữ liệu)
- Sparkle: `<svg>` path for AI icon (Tìm đáp án)
