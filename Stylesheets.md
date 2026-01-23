# Introduction

# Conversion Chart
px = em * px (font)
em = px / px (font)

# Fonts
## Family
| Name | Description |
|------|-------------|
| Inter | Figma's default font. |
| Space Grotesk | Danny's font for headlines. |
| Roboto | Google's Material font. |
| SF Pro Display | Apple's font. |
| SF Pro Icons | |
| Helvetica Neue | |
| Helvetica | |
| Oswald | Goof for skinny stuff |
| Poppins | |
| Manrope | |

## Sizes
| Class | Size | Height | Weight | Letter Spacing | Usage |
|-------|------|--------|--------|----------------|-------|
| Headline | 56px | 60px | 600 (Semi Bold) | -0.28px | Hero title |
| Subhead | 28px | 32px | 400 (Normal) | 0.196px | Hero subtitle |
| Heading 1 | 28px | 34px | 400 (Normal) | 0em | Page title, card title |
| Heading 2 | 22px | 28px | 400 (Normal) | 0em | Section title | 
| Heading 3 | 20px | 25px | 400 (Normal) | 0em | Section subtitle |
| Heading 4 | 17px | 22px | 600 (Semi Bold | 0em |
| Heading 5 | 15px | 20px | 400 (Normal) | 0em|
| Heading 6 | 13px | 18px | 400 (Normal) | 0em | Card subtitle |
| Body | 17px | 22px | Body text, card content |
| Footnote | 12px | 16px | 400 (Normal) | 0.12px | Footnotes |


# Colour Palette

This is a refined color palette designed for clean, minimal web/app designs with maximum consistency and minimal decision fatigue.

## Core Colour Roles

| Role                 | Usage Guidelines                                                                 | Examples                                                                          |
| :------------------- | :------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| **background**       | Main application background. The canvas for everything.                          | Page backgrounds, modal backgrounds, card bases                                   |
| **surface**          | Elevated or separated content areas that need subtle distinction from background | Cards, panels, dropdowns, popovers, navigation bars                               |
| **text**             | All readable content                                                             | Body text, headings, labels                                                       |
| **text-muted**       | Secondary information, supporting text that should recede visually               | Captions, helper text, timestamps, placeholder text                               |
| **accent**           | Primary interactive elements and brand moments                                   | Primary buttons, hover (20% opacity), links, selected states, progress indicators |
| **accent-secondary** | Supporting (non-competing) accent moments                                        | Subtle backgrounds for hover-states, highlights, etc.                             |
| **border**           | All dividing lines and outlines                                                  | Input borders, dividers, card outlines, table borders                             |

## Semantic Colors (Use Sparingly)

| Role        | Usage Guidelines                 | Examples                                                |
| :---------- | :------------------------------- | :------------------------------------------------------ |
| **success** | Positive outcomes, confirmations | Success messages, completed states, positive indicators |
| **warning** | Caution, non-critical issues     | Warning messages, pending states                        |
| **danger**  | Errors, destructive actions      | Error messages, delete buttons, critical alerts         |
| **info**    | No meaning implied               | Informational messages                                  |

**Important:** Info color can be optioal - use `accent` instead for informational UI elements.

## Implementation Strategy

### 1. Color Definition Pattern

Define your colors using this minimal approach:

```css
/* Light Theme Example */
--background: #ffffff;
--surface: rgba(0, 0, 0, 0.03); /* 3% black on white */
--text: rgba(0, 0, 0, 0.9); /* 90% black */
--text-muted: rgba(0, 0, 0, 0.5); /* 50% black */
--accent: #ff7edb; /* Your brand */
--accent-muted: #a148ab80 --border: rgba(0, 0, 0, 0.1); /* 10% black */

--success: #16a34a;
--warning: #ea580c;
--danger: #dc2626;
```

```css
/* Dark Theme Example */
--background: #0a0a0a;
--surface: rgba(255, 255, 255, 0.05); /* 5% white on black */
--text: rgba(255, 255, 255, 0.9); /* 90% white */
--text-muted: rgba(255, 255, 255, 0.5); /* 50% white */
--accent: #ff7edb;
--accent-muted: #a148ab80 --border: rgba(255, 255, 255, 0.1); /* 10% white */

--success: #22c55e;
--warning: #f97316;
--danger: #ef4444;
```

### 2. Creating Variations Without New Colors

**Never add new color variables.** Instead, layer opacity:

```css
/* DON'T do this */
--surface-secondary: #f5f5f5;
--surface-tertiary: #eeeeee;

/* DO this instead */
background-color: var(--surface);
background-color: rgba(0, 0, 0, 0.06); /* 2x the surface opacity */
```

**Opacity scale for backgrounds (on light themes):**

- Subtle: `rgba(0, 0, 0, 0.03)` - 3%
- Light: `rgba(0, 0, 0, 0.06)` - 6%
- Medium: `rgba(0, 0, 0, 0.10)` - 10%
- Strong: `rgba(0, 0, 0, 0.15)` - 15%

**Opacity scale for text (on light themes):**

- Primary: `rgba(0, 0, 0, 0.90)` - 90%
- Secondary: `rgba(0, 0, 0, 0.50)` - 50%
- Tertiary: `rgba(0, 0, 0, 0.35)` - 35%
- Disabled: `rgba(0, 0, 0, 0.25)` - 25%

### 3. Accent Variations

For accent color variations, use the color with different opacities:

```css
/* Solid accent */
background: var(--accent);

/* Muted accent backgrounds */
background: color-mix(in srgb, var(--accent) 10%, transparent);
background: rgba(37, 99, 235, 0.1); /* If using blue accent */

/* Hover states */
background: color-mix(in srgb, var(--accent) 90%, black);

/* Active states */
background: color-mix(in srgb, var(--accent) 80%, black);
```

## Decision Tree: Which Color to Use

### Backgrounds

- **Main page/app area?** → `background`
- **Card, panel, or elevated surface?** → `surface`
- **Need more separation?** → `rgba(0, 0, 0, 0.06)` on light or `rgba(255, 255, 255, 0.08)` on dark
- **Hover state on surface?** → Add `rgba(0, 0, 0, 0.03)` on top

### Text

- **Main content?** → `text`
- **Supporting/secondary info?** → `text-muted`
- **Need emphasis?** → Use `font-weight: 600` with `text` (don't add a new color)
- **Disabled state?** → `rgba(0, 0, 0, 0.25)` or similar low opacity

### Interactive Elements

- **Primary action (save, submit, etc.)?** → `accent` background with white text
- **Secondary action?** → `border` outline with `text` color
- **Destructive action?** → `danger`
- **Links?** → `accent` color for text
- **Hover on accent button?** → Darken accent by 10%: `color-mix(in srgb, var(--accent) 90%, black)`

### Borders & Dividers

- **All borders, dividers, input outlines?** → `border`
- **Focused input?** → `accent`
- **Error state?** → `danger`

### Status & Feedback

- **Success message/state?** → `success`
- **Warning message/state?** → `warning`
- **Error message/state?** → `danger`
- **Info/neutral message?** → `accent` (not a separate info color)

---

## Golden Rules

1. **Only 10 colors total:** background, surface, text, text-muted, accent, accent-muted, border, success, warning, danger
2. **Create contrast with opacity,** not new colors
3. **One accent color** for your brand - use it consistently
4. **Borders use the border color** - don't use surface or create new border colors
5. **Semantic colors (success/warning/danger) are for semantics only** - not decoration
6. **When in doubt, use less color** - try text-muted or opacity before adding emphasis

---

## Common UI Pattern Examples

| Element                      | Color Choice                                         | Reasoning                                           |
| :--------------------------- | :--------------------------------------------------- | :-------------------------------------------------- |
| Input field background       | `background`                                         | Inputs sit on surface, so they use base background  |
| Input field border           | `border`                                             | Standard border color                               |
| Input field (focused) border | `accent`                                             | Interactive state uses accent                       |
| Navbar                       | `surface`                                            | Elevated from background                            |
| Sidebar                      | `background`                                         | Can be same as main background, separated by border |
| Button (primary)             | `accent` bg, white text                              | Main action in resting state                        |
| Button (hover)               | `accent` bg, white text                              | Main action on hover to signal "YES, do me"         |
| Button (secondary)           | `border` outline, `text` color                       | Less prominent action                               |
| Button (danger)              | `danger` bg, white text                              | Destructive action only                             |
| Badge background             | `rgba(accent, 0.10)` with `accent` text              | Subtle branded element                              |
| Disabled button              | `rgba(0, 0, 0, 0.10)` bg, `rgba(0, 0, 0, 0.25)` text | Low opacity, not a new color                        |
| Table header                 | `surface`                                            | Subtle separation                                   |
| Table row hover              | `rgba(0, 0, 0, 0.03)`                                | Very subtle highlight                               |
| Code blocks                  | `surface` with `rgba(0, 0, 0, 0.03)` border          | Monospace text, subtle container                    |

---

This system gives you everything you need while preventing color chaos. Stick to these 9 colors and use opacity for all variations—your designs will be cleaner, more consistent, and faster to build.

## Canvas Layout Patterns

### Standard

```
┌─────────────────────────────────────┐
│ ← 16px margin (--background)        │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │   Main app canvas (--surface) │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

### Minimalist

```
┌─────────────────────────────────────┐
│                                     │
│   Components sit directly on        │
│   background with no frame          |
|   (--background).                   │
│                                     │
│                                     │
└─────────────────────────────────────┘
```

