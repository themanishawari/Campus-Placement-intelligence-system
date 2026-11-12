---
name: Placement Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d4d9f2'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e3e7ff'
  surface-container-highest: '#dce1fb'
  on-surface: '#151b2d'
  on-surface-variant: '#45464d'
  inverse-surface: '#2a3043'
  inverse-on-surface: '#eef0ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#3755c3'
  on-secondary: '#ffffff'
  secondary-container: '#708cfd'
  on-secondary-container: '#00217a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#001a42'
  on-tertiary-container: '#3980f4'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dde1ff'
  secondary-fixed-dim: '#b8c4ff'
  on-secondary-fixed: '#001453'
  on-secondary-fixed-variant: '#173bab'
  tertiary-fixed: '#d8e2ff'
  tertiary-fixed-dim: '#adc6ff'
  on-tertiary-fixed: '#001a42'
  on-tertiary-fixed-variant: '#004395'
  background: '#faf8ff'
  on-background: '#151b2d'
  surface-variant: '#dce1fb'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.025em
  display-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: 1.75rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.5rem
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1rem
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.025em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 0.6875rem
    fontWeight: '500'
    lineHeight: 0.875rem
    letterSpacing: 0.035em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes an authoritative, precise, and intelligence-driven visual environment engineered for enterprise security operations and placement intelligence analysts. The brand personality projects absolute vigilance, analytical rigor, and operational confidence. 

The aesthetic is anchored in **Corporate High-Contrast Precision** with structured architectural clarity. It avoids visual clutter or frivolous decoration in favor of high-density data parsing, low latency comprehension, and unambiguous hierarchy. Every pixel is intentional: sharp typographic contrast, restrained and purposeful chromatic signaling, and systematic surface transitions convey mission-critical utility.

## Colors

The palette employs deep naval infrastructure tones paired with high-clarity ice-slate neutrals. Semantic signals are calibrated to meet stringent enterprise accessibility standards (WCAG AAA for text, AA for UI boundaries).

### Palette Architecture
- **Primary Navy Infrastructure (`#0f172a`, `#1e40af`):** Grounding surfaces, primary actions, critical navigation anchors, and dominant interactive components.
- **Secondary Atmospheric Blue (`#1d4ed8`, `#3b82f6`):** Focused states, dynamic active states, and analytical charting accents.
- **Surfaces & Containers:**
  - `surface-canvas`: `#f8fafc` (Ultra-crisp canvas)
  - `surface-container-low`: `#f1f5f9` (Structural sectioning)
  - `surface-container-high`: `#e2e8f0` (Borders, card dividers, and active hover envelopes)
  - `surface-card`: `#ffffff` (Elevated focus modules)
- **Semantic Intelligence Indicators:**
  - **Verified / Safe:** `#059669` (Emerald 600) with `#ecfdf5` background tints.
  - **Claimed / Pending / Review:** `#d97706` (Amber 600) with `#fffbeb` background tints.
  - **Blocked / Threat / Expired:** `#e11d48` (Rose 600) with `#fff1f2` background tints.

## Typography

The typographic hierarchy prioritizes rapid scanning, numerical readability, and structural efficiency.

- **Primary UI & Headings:** `Hanken Grotesk` delivers geometric discipline without sacrificing legibility at small sizes. Headings are tight, dense, and assertive.
- **Data & Intelligence Attributes:** `JetBrains Mono` is assigned to operational metadata, cryptographic hashes, timestamps, IP nodes, status codes, and table metrics. It enforces proportional tabular alignment across dense monitoring grids.

## Layout & Spacing

The layout model is driven by a high-density, multi-pane fluid grid system designed for operational triage displays and data-dense dashboards.

- **Grid Strategy:** A responsive 12-column grid system paired with strict horizontal rhythm. Margins contract to `1rem` on mobile breakpoints, expand to `1.5rem` on tablet, and settle at `2rem` on wide desktop workstations.
- **Density Tiering:** Data tables and audit panels adopt compact internal paddings (`space-xs` and `space-sm`) to maximize visible information density per viewport. Executive overview panels and configuration flows leverage `space-md` through `space-xl` for deliberate focus.

## Elevation & Depth

This design system avoids blurry, exaggerated drop-shadows. Depth is articulated through **tonal layers** combined with **crisp, low-contrast hairline borders**.

- **Level 0 (Base Canvas):** `#f8fafc` — Deep foundational canvas.
- **Level 1 (Card & Module Layer):** Pure `#ffffff` surface delineated by a 1px solid border in `#e2e8f0`.
- **Level 2 (Active Overlays, Flyouts & Modals):** Pure `#ffffff` surface, 1px solid border in `#cbd5e1`, paired with a structured, cold-tinted ambient occlusion shadow: `0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)`.
- **Level 3 (Tooltips & Popovers):** High-contrast `#0f172a` primary background with crisp `#334155` borders for immediate prominence over complex analytics.

## Shapes

The design system employs a **Soft (Level 1)** geometric language. Interfaces utilize `0.25rem` (4px) corner radii on basic inputs, chips, and small controls, scaling to `0.5rem` (8px) on standard cards and content modules, and capping at `0.75rem` (12px) for critical dialogs. 

This restrained curvature preserves a sharp, technical contour befitting high-reliability enterprise security software, rejecting overly playful or consumerized rounded forms.

## Components

### Buttons
- **Primary:** Filled `#0f172a` with white text. Focus state triggers a 2px offset ring in `#1e40af`. Hover darkens to `#020617`.
- **Secondary:** Surface `#ffffff` with 1px border in `#cbd5e1`, text in `#0f172a`. Hover shifts background to `#f1f5f9`.
- **Destructive / High Alert:** Filled `#e11d48` or outlined `#e11d48` with matched focus rings.

### Status Chips & Badges
Chips maintain a strict semantic identity using light tint fills, 1px high-contrast borders, and uppercase `JetBrains Mono` text:
- **Verified:** Background `#ecfdf5`, border `#a7f3d0`, text `#065f46`. Includes a 6px solid emerald indicator dot.
- **Claimed / Pending:** Background `#fffbeb`, border `#fde68a`, text `#92400e`. Includes a 6px solid amber indicator dot.
- **Blocked / Expired:** Background `#fff1f2`, border `#fecdd3`, text `#9f1239`. Includes a 6px solid rose indicator dot.

### Data Tables & Lists
- Table headers use `label-sm` in `JetBrains Mono`, `#475569`, tracking uppercase with a solid `#e2e8f0` bottom border.
- Alternating rows employ subtle zebra striping (`#ffffff` to `#f8fafc`) with hover highlights in `#f1f5f9`.
- Row height standard: `36px` (compact) or `48px` (default).

### Input Fields & Controls
- Form controls feature a 1px `#cbd5e1` boundary on pure white, shifting to a 2px `#1e40af` border on focus with zero ambient shadow.
- Checkboxes and radio buttons maintain sharp 2px borders, checked with primary deep navy `#0f172a`.

### Cards & Analytical Panels
- Structural cards use `#ffffff` surface, 1px `#e2e8f0` border, and `0.5rem` radius. Header regions are partitioned by a horizontal 1px rule in `#f1f5f9`.