# Local Ezzy CRM - Design System

This document outlines the design philosophy, color palette, and component standards for the **Local Ezzy CRM**. The primary goal is to provide a premium, modern, and high-performance user experience using a consistent dark-themed aesthetic.

---

## 🎨 Color Palette (Premium Dark)

The theme is built on a deep slate foundation with vibrant primary and status accents.

### Core Backgrounds
| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--bg-main` | `#0f172a` | Primary app background |
| `--bg-surface` | `#1e293b` | Cards, sidebars, and modals |
| `--bg-surface-hover` | `#334155` | Hover states for interactive elements |

### Typography & Borders
| Variable | Value | Usage |
| :--- | :--- | :--- |
| `--text-main` | `#f8fafc` | Headlines and body text |
| `--text-muted` | `#94a3b8` | Secondary labels and descriptions |
| `--border-color` | `#334155` | Dividers and element borders |

### Brand & Accents
| Color | Variable | Value |
| :--- | :--- | :--- |
| **Primary** | `--primary` | `#6366f1` (Indigo) |
| **Accent** | `--accent` | `#ec4899` (Pink) |
| **Success** | `--status-qualified` | `#10b981` (Emerald) |
| **Warning** | `--status-contacted` | `#f59e0b` (Amber) |
| **Info** | `--status-new` | `#3b82f6` (Blue) |

---

## 🔡 Typography

- **Primary Font:** [Outfit](https://fonts.google.com/specimen/Outfit) (Sans-serif)
- **Weights used:** 300, 400, 500, 600, 700
- **Base Size:** `16px`

---

## ✨ Design Principles

1.  **Glassmorphism:** Use subtle transparency and background blur (`backdrop-filter: blur(10px)`) on top bars and floating elements to create depth.
2.  **Soft Corners:** Consistent border-radius throughout the app:
    *   `--radius-sm`: 6px (Buttons, small inputs)
    *   `--radius-md`: 12px (Cards, small modals)
    *   `--radius-lg`: 20px (Main modals, containers)
3.  **Micro-animations:** All interactive elements (buttons, nav items, cards) should have a `0.3s cubic-bezier(0.4, 0, 0.2, 1)` transition for a "fluid" feel.
4.  **Information Hierarchy:** Use color-coded status dots and badges to make lead states scannable at a glance.

---

## 📦 Components

### Sidebar
- **Width:** 250px
- **Style:** Fixed, dark surface background with a subtle border-right.
- **Nav Items:** Vertical stack with icon + text. Active state uses the primary indigo background with a subtle drop shadow.

### Top Bar
- **Height:** 70px
- **Style:** Glassmorphic background with center-aligned search and right-aligned user profile.

### Kanban Cards (Leads)
- **Style:** Surface background with a vertical status bar on the left edge.
- **Interactions:** Lift effect on hover (`transform: translateY(-3px)`).

### Data Tables (Companies)
- **Style:** Collapsed borders, surface background headers, and subtle row dividers.
- **Row Hover:** Light background tint to highlight active row.

### Leads Insights Dashboard & Details
- **Dashboard Grid:** Metric summary cards displaying Total, Won, and Qualified Leads, plus Conversion Rate, styled with rich color gradients.
- **Dynamic Search & Filtering:** Live inputs for filtering leads by query, country/state/city location, requirement category, status, and result, with real-time stats updates.
- **Collapsible Detail Panels:** Chevron-triggered panels showing detailed notes, contact channels, and follow-up timeline inline.
- **Lead Profile & Interactions Timeline:** A detailed profile overview card paired with a chronological timeline of interactions and an interactive follow-up log form that updates the main database status in real-time.

### Modals
- **Style:** Centered overlay with a deep blur. Modals use the `--radius-lg` and have a distinct border to separate them from the background.

---

## 🛠 Icons

- **Library:** [Font Awesome 6 (Solid)](https://fontawesome.com/)
- **Usage:** Standardized 16px-20px sizing for menu items and action buttons.
