---
name: Power Engineering Precision
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#434655'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#49607e'
  on-secondary: '#ffffff'
  secondary-container: '#c4dcff'
  on-secondary-container: '#49617f'
  tertiary: '#784b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#996100'
  on-tertiary-container: '#ffeedd'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#d2e4ff'
  secondary-fixed-dim: '#b0c8eb'
  on-secondary-fixed: '#001c37'
  on-secondary-fixed-variant: '#314865'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: '0'
  body-base:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: '0'
  body-medium:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: '0'
  label-caps:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  stat-lg:
    fontFamily: Geist
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: '0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  container-max: 1280px
  form-max: 768px
---

## Brand & Style

This design system is engineered for **Power Engineering Precision**. It targets a professional user base within the utility management sector, emphasizing institutional reliability and administrative clarity. The aesthetic is a refined blend of **Corporate Modernism** and **Tactile Precision**, designed to make complex construction data feel manageable and secure.

The visual narrative is built on a **Split Canvas philosophy**: a dark, anchoring "Midnight" navigation sidebar representing corporate stability, contrasted against a crisp, "Airy" workspace for data manipulation. The emotional response should be one of "command and control"—providing the user with a focused environment where critical infrastructure data is surfaced with engineering-grade accuracy.

Key stylistic markers include:
- **Precision Geometries**: Use of architectural-inspired 12px corner radii to balance approachable softness with structural integrity.
- **Micro-textures**: Subtle 1px grid patterns reminiscent of blueprints applied to login and empty states.
- **Clinical Clarity**: High-contrast typography and generous whitespace within data-heavy views to reduce cognitive load.

## Colors

The palette modernizes the traditional PLN legacy with a functional, high-contrast digital scale.

- **Primary (Vibrant Blue)**: Used strictly for interactive triggers, primary buttons, and active focus states. It signifies "Action."
- **Secondary (Midnight Navy)**: Used for structural grounding, including the main navigation sidebar and primary headers. It signifies "Authority."
- **Tertiary (Energy Amber)**: Reserved for status signaling, alerts, and warning-level indicators. It signifies "Attention."
- **Neutral (App Canvas)**: A slate-tinted white background for the main workspace to minimize eye strain during long-form data entry.

**Functional Tints**: Use 50-100 level tints of status colors for badge backgrounds (e.g., Emerald-50 for success pills) to ensure text legibility remains the priority.

## Typography

The typography system prioritizes data density and tabular readability. 

- **Geist** is used for headings and labels to provide a sharp, technical character.
- **Inter** is used for body text and form values to ensure maximum legibility across all screen types.
- **JetBrains Mono** (or any clean Monospace) is utilized for project codes (e.g., `PRJ-2026-001`) and currency values to maintain alignment in tables.

**Hierarchical Rules**:
- Titles should use tight letter-spacing (`-0.02em`) to feel "engineered" and sturdy.
- Descriptive body text remains at `14px` to maximize information density without sacrificing accessibility.
- Status badges use `12px` bold uppercase labels to create high visual distinction from surrounding data.

## Layout & Spacing

This design system uses a **Fluid Grid model** based on a 4px baseline shift.

- **Desktop**: 12-column grid with 24px margins. Content is housed in cards that span 3, 4, 6, or 12 columns depending on information weight.
- **Tablet**: 8-column grid with 20px margins. Sidebars collapse into a "compact" icon-only mode.
- **Mobile**: 4-column grid with 16px margins. Cards stack vertically; horizontal padding is reduced to 16px to maximize content area.

**Form Rhythm**: Keep a tight 6px vertical gap between labels and input fields to maintain visual grouping. Page containers for administrative forms should be constrained to a `768px` max-width to prevent line lengths from becoming unreadable on wide monitors.

## Elevation & Depth

Visual hierarchy is established through **Tonal Layering** and **Low-Contrast Outlines** rather than aggressive shadows.

- **Surface Levels**: The background is `#f8fafc`. Primary content cards sit on top in `#ffffff`.
- **Borders**: Elements are defined by 1px solid borders in `#e2e8f0` (Slate 200). This provides a crisp, engineering-grade finish that feels "flat" and professional.
- **Shadows**: Use a single "Ambient Shadow" for elevated elements like Modals or Popovers: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`. 
- **Focus States**: Depth is communicated through color rather than shadow—focused inputs receive a 2px solid primary blue ring to draw the eye immediately.

## Shapes

The shape language is consistently **Rounded** (Level 2).

- **Standard Elements (Buttons, Inputs)**: 0.5rem (8px) for a balanced, modern feel.
- **Container Elements (Cards, Panels)**: 1rem (16px) for larger surfaces to create a distinct frame for content.
- **Status Pills**: Full rounded (9999px) to distinguish them from interactive buttons.

This consistent use of rounded corners softens the "institutional" navy palette, making the app feel contemporary and user-friendly while maintaining the structure required for an ERP.

## Components

### Buttons
- **Primary**: Solid `#2563eb` with white text. High tactility, 44px height for main actions.
- **Secondary**: Outline style with `#e2e8f0` border and `#0f172a` text.
- **Interactive States**: 150ms ease-in-out transition on hover (darken 10%) and active (darken 20%).

### Input Fields
- **Anatomy**: 40px height, 12px padding, `#e2e8f0` border.
- **Specialty (Currency)**: Persistent "Rp" prefix in `#64748b` (Slate 500) fixed to the left with 36px left padding for the numeric value.
- **Validation**: Error states use a `#ef4444` border and a small supporting text label below the field.

### Status Badges
- Small, pill-shaped indicators.
- **Draft**: Slate background/text.
- **Active**: Blue background/text.
- **Completed**: Emerald background/text.
- **Overdue**: Red background/text.

### Stat Cards
- Large numeric value (`stat-lg`) in `#0f172a`.
- A top-right "Icon Box" (40x40px, 12px roundedness) using a 10% opacity tint of the primary color to house a relevant functional icon.

### Progress Bars
- 6px height track in `#f1f5f9`.
- Dynamic color logic: Amber (<50%), Blue (50-99%), Emerald (100%).