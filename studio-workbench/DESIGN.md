# Design System

## Visual Theme

Light theme with warm-stone palette. Warm ivory backgrounds, champagne gold accents, muted earth-tone status colors. The design evokes premium photography studio quality — restrained, warm, professional.

## Color Palette

### Core
- **Background**: `#F0EBE2` (warm stone)
- **Content surface**: `#FAF8F4` (warm white)
- **Dark / Ink**: `#1A1814` (near-black warm)
- **Accent / Brand**: `#B8842E` (champagne gold)
- **Accent soft**: `#D4B06A`
- **Text muted**: `#6B6052` (warm gray)
- **Borders**: `rgba(26, 24, 20, 0.12)`

### Status Colors
| Role | Foreground | Background |
|---|---|---|
| Pending | `#C49A2A` | `#FDF6E3` |
| Confirmed | `#4A6274` | `#E8EDF2` |
| Shooting | `#2D7A6A` | `#E6F5F0` |
| Selecting | `#7A5A8A` | `#F3EDF6` |
| Done | `#2D7A4D` | `#EBF4ED` |
| Warn | `#B8842E` | `#FAF1D8` |
| Danger | `#B8543B` | `#FDF0ED` |
| Neutral | `#8A8278` | `#F0EDEA` |

### Chart Palette (5-color low saturation)
`#B8842E` · `#5B7A8A` · `#2D7A6A` · `#8A6A7A` · `#6A8A5B`

## Typography

- **Serif**: Noto Serif SC (headings, hero moments)
- **Sans**: Noto Sans SC (body, UI text)
- **Mono**: JetBrains Mono (IDs, codes, eyebrow labels)

### Scale
| Token | Size |
|---|---|
| micro | 12px |
| caption | 13px |
| body | 14px |
| body-lg | 15.5px |
| label | 16px |
| title | 20px |
| title-lg | 26px |
| stat | 34px |
| stat-xl | 48px |

## Components

- **Glass panel** (`yy-glass-panel`): Frosted glass hero sections with backdrop blur
- **Console card** (`yy-console-card`): Standard content containers with subtle borders
- **Action button** (`yy-action`): Interactive elements with press/hover states
- **State badges**: Rounded pills with semantic status colors
- **Fade transition**: 240ms opacity ease for modals and notices

## Layout

- Sidebar: 248px fixed width with active state highlighting
- Content area: Flexible with 24px+ consistent spacing
- Cards: `rounded-[18px]` to `rounded-[28px]` depending on hierarchy
- Shadows: Rest `0 1px 1px rgba(26,24,20,0.04), 0 10px 28px rgba(26,24,20,0.05)`

## Motion

- Ease out: `cubic-bezier(0.16, 1, 0.3, 1)` for smooth deceleration
- Press feedback: `cubic-bezier(0.2, 0, 0, 1)`
- Hover lift: `-translate-y-1` on product cards
- Reduced motion: Respects `prefers-reduced-motion`