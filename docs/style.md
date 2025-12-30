# jLinks Style Guide

This document defines the visual language for jLinks. All design tokens are centralized in `apps/admin/src/styles/variables.css` - changes there propagate throughout the application.

---

## Color Palette

### Admin Interface Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#FAFAFA` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, modals, inputs |
| `--color-border` | `#E5E5E5` | Subtle borders |
| `--color-border-hover` | `#D4D4D4` | Hover state borders |

### Primary (Turquoise Jon Labs)

| Token | Value | Usage |
|-------|-------|-------|
| `--color-primary` | `#00D9A3` | Primary buttons, accents |
| `--color-primary-hover` | `#00A87D` | Button hover |
| `--color-primary-light` | `#E6FBF5` | Selected backgrounds, badges |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text` | `#0F172A` | Primary text |
| `--color-text-secondary` | `#64748B` | Secondary text, labels |
| `--color-text-muted` | `#94A3B8` | Placeholder, hints |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#10B981` | Success states, published |
| `--color-warning` | `#F59E0B` | Warning states, draft |
| `--color-error` | `#EF4444` | Error states, deletion |

### Sidebar

| Token | Value | Usage |
|-------|-------|-------|
| `--color-sidebar-bg` | `#FFFFFF` | Sidebar background |
| `--color-sidebar-hover` | `#F5F5F5` | Item hover |
| `--color-sidebar-active` | `#E6FBF5` | Active item |

---

## Typography

### Font Family

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

**Note:** Inter for admin UI (standard). Space Grotesk reserved for Jon Labs public site.

### Font Sizes

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-page-title` | 24px | 600 | Page titles |
| `--text-section-title` | 18px | 600 | Section headers |
| `--text-label` | 14px | 500 | Form labels |
| `--text-body` | 14px | 400 | Body text |
| `--text-small` | 12px | 400 | Hints, captions |

### Line Heights

| Token | Value |
|-------|-------|
| `--leading-tight` | 1.25 |
| `--leading-normal` | 1.5 |
| `--leading-relaxed` | 1.75 |

---

## Spacing System

Based on 4px increments for consistency.

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | 4px | Minimal spacing |
| `--space-sm` | 8px | Tight spacing |
| `--space-md` | 16px | Default spacing |
| `--space-lg` | 24px | Section spacing |
| `--space-xl` | 32px | Large gaps |
| `--space-2xl` | 48px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements, badges |
| `--radius-md` | 6px | Buttons, inputs |
| `--radius-lg` | 8px | Cards, modals |
| `--radius-full` | 9999px | Pills, avatars |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.04)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.05)` | Cards, dropdowns |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.08)` | Modals, popovers |

---

## Transitions

| Token | Value | Usage |
|-------|-------|-------|
| `--transition-fast` | `150ms ease-out` | Hover states |
| `--transition-normal` | `200ms ease-out` | Appearance changes |
| `--transition-slow` | `300ms ease-out` | Large movements |

---

## Breakpoints

| Name | Value | Usage |
|------|-------|-------|
| Mobile | `< 768px` | Single column, burger menu |
| Tablet | `768px - 1024px` | Collapsible sidebar, preview modal |
| Desktop | `> 1024px` | Fixed sidebar, split view |

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-dropdown` | 10 | Dropdowns |
| `--z-sticky` | 20 | Sticky headers |
| `--z-modal` | 30 | Modals |
| `--z-toast` | 40 | Toast notifications |
| `--z-tooltip` | 50 | Tooltips |

---

## Component Specifications

### Button

```css
/* Primary */
.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 8px 16px;
  font-weight: 500;
  font-size: var(--text-body);
}
.btn-primary:hover {
  background: var(--color-primary-hover);
}

/* Secondary */
.btn-secondary {
  background: transparent;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 8px 16px;
}
.btn-secondary:hover {
  border-color: var(--color-border-hover);
  background: var(--color-surface);
}

/* Ghost */
.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: none;
  padding: 8px;
  border-radius: var(--radius-md);
}
.btn-ghost:hover {
  background: #F5F5F5;
  color: var(--color-text);
}

/* Danger */
.btn-danger {
  background: var(--color-error);
  color: white;
}
```

**Sizes:**
- Small: padding 6px 12px, font-size 12px
- Default: padding 8px 16px, font-size 14px
- Large: padding 12px 24px, font-size 16px

### Input

```css
.input {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  font-size: var(--text-body);
  color: var(--color-text);
}
.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}
.input::placeholder {
  color: var(--color-text-muted);
}
.input:disabled {
  background: var(--color-bg);
  cursor: not-allowed;
}
.input.error {
  border-color: var(--color-error);
}
```

### Card

```css
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
}
.card-hover:hover {
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-sm);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}
```

### Badge

```css
.badge {
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--text-small);
  font-weight: 500;
}
.badge-published {
  background: #D1FAE5;
  color: #065F46;
}
.badge-draft {
  background: #FEF3C7;
  color: #92400E;
}
.badge-pro {
  background: var(--color-primary-light);
  color: var(--color-primary-hover);
}
```

### Toggle

```css
.toggle {
  width: 44px;
  height: 24px;
  background: var(--color-border);
  border-radius: var(--radius-full);
  position: relative;
  cursor: pointer;
}
.toggle.active {
  background: var(--color-primary);
}
.toggle-knob {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: transform var(--transition-fast);
}
.toggle.active .toggle-knob {
  transform: translateX(20px);
}
```

### Modal

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}
.modal {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  max-width: 480px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-md);
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-sm);
  margin-top: var(--space-lg);
}
```

### Toast

```css
.toast {
  position: fixed;
  bottom: var(--space-lg);
  right: var(--space-lg);
  background: var(--color-text);
  color: white;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  z-index: var(--z-toast);
  animation: slideIn 300ms ease-out;
}
.toast-success {
  background: var(--color-success);
}
.toast-error {
  background: var(--color-error);
}
@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
```

---

## Icons

**Library:** Lucide Icons
**Default size:** 20px for UI, 16px for inline
**Stroke:** 1.5px
**Color:** `var(--color-text-secondary)` default, `var(--color-text)` on hover

---

## Layout Guidelines

### Admin Layout

```
┌─────────────────────────────────────────────────────────┐
│ Sidebar (240px)     │  Main Content                     │
│ ─────────────────   │  ───────────────────────────────  │
│                     │                                    │
│ Logo                │  Header                           │
│ ─────────────       │  ┌───────────────────────────────┐│
│ Navigation          │  │ Title           [Actions]     ││
│   Dashboard         │  └───────────────────────────────┘│
│   Links       ←     │                                    │
│   Settings          │  Content                          │
│ ─────────────       │  ┌──────────────┬────────────────┐│
│ Super Admin         │  │              │                ││
│   Clients           │  │  Main (60%)  │  Preview (40%) ││
│                     │  │              │                ││
│                     │  └──────────────┴────────────────┘│
│ ─────────────       │                                    │
│ User Menu           │                                    │
│   Logout            │                                    │
└─────────────────────────────────────────────────────────┘
```

### Responsive Behavior

| Breakpoint | Sidebar | Preview |
|------------|---------|---------|
| Desktop | Fixed 240px | Inline split 40% |
| Tablet | Collapsible | Modal |
| Mobile | Burger menu | Hidden / Modal |

---

## CSS Variables File

The complete variables file should be at `apps/admin/src/styles/variables.css`:

```css
:root {
  /* Colors - Background */
  --color-bg: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-border: #E5E5E5;
  --color-border-hover: #D4D4D4;

  /* Colors - Primary */
  --color-primary: #00D9A3;
  --color-primary-hover: #00A87D;
  --color-primary-light: #E6FBF5;

  /* Colors - Text */
  --color-text: #0F172A;
  --color-text-secondary: #64748B;
  --color-text-muted: #94A3B8;

  /* Colors - Semantic */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-error: #EF4444;

  /* Colors - Sidebar */
  --color-sidebar-bg: #FFFFFF;
  --color-sidebar-hover: #F5F5F5;
  --color-sidebar-active: #E6FBF5;

  /* Typography */
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --text-page-title: 24px;
  --text-section-title: 18px;
  --text-label: 14px;
  --text-body: 14px;
  --text-small: 12px;

  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08);

  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 200ms ease-out;
  --transition-slow: 300ms ease-out;

  /* Z-index */
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal: 30;
  --z-toast: 40;
  --z-tooltip: 50;

  /* Layout */
  --sidebar-width: 240px;
  --header-height: 64px;
}
```
