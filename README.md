# ChromaForge

> Intelligent palette refinement and accessibility tooling for modern UI systems.

ChromaForge is a professional color system builder designed for UI/UX designers, frontend developers, and design systems teams.

Instead of simply generating palettes, ChromaForge analyzes, corrects, harmonizes, and validates color systems through a guided workflow focused on accessibility, visual consistency, and production-ready design.

The application combines:

* palette generation
* semantic color systems
* WCAG validation
* perceptual color analysis
* intelligent suggestions
* live UI previews
* export tooling

into a single modern experience.

---

# Features

## Wizard-Based Workflow

ChromaForge uses a structured multi-step workflow with persistent sidebar navigation and global palette bar.

### Steps

1. Palette Builder
2. Analysis & Color Suggestions
3. WCAG Testing
4. Naming & Semantic Roles
5. Live Preview & Export

---

# Step 1 — Palette Builder

Build and organize your palette visually.

## Features

* Unlimited colors
* Drag & drop reordering (toggleable via "Reorder" button — handles only visible when active)
* Modern color picker with EyeDropper API (falls back to native picker on non-Chromium)
* HEX display (inline editing via color modal)
* Role assignment via collapsible dropdown (chips when closed, checkbox list when open)
* Role conflict detection (a role can never be shared by 2 colors)
* Duplicate/remove colors
* Import existing palettes via HEX input
* Global Palette Bar at bottom (fixed, content padded 96px)
* Color modal with inline HEX/RGB/HSL editing, copy, and color picker

## Semantic Roles

16 roles across 5 groups:

* Background, Surface
* Primary, Secondary, Tertiary
* Accent
* Success, Warning, Error, Info
* Border, Text Primary, Text Secondary, Neutral, Neutral Light, Neutral Dark

---

# Step 2 — Analysis & Color Suggestions

Palette DNA–driven analysis engine continuously evaluates palette quality.

## Palette DNA

The engine computes a `PaletteDNA` signature from your palette using OKLCH color space:

* Dominant hue (circular mean)
* Average chroma and lightness
* Saturation variance
* Warm/cool tendency
* Vibrancy
* Overall mood

This DNA powers all suggestions and semantic derivations.

## Palette Health Analysis

Detects issues such as:

* Missing neutrals
* No light surfaces
* Excessive saturation
* Mixed color temperatures
* Inconsistent tonal hierarchy
* Poor accessibility contrast
* Eye strain risk
* Weak semantic structure

## Color Suggestions

ChromaForge generates contextual recommendations based on the current palette DNA.

Suggestions include:

* Neutral systems (hue-biased from palette, not pure gray)
* Light/dark surfaces
* Semantic error/success/warning/info colors
* Accessible replacements
* Softer variants
* Tonal bridge colors

Each suggestion card includes:

* Color preview
* Suggested role
* Explanation
* Accessibility impact
* Add button
* Shuffle button (cycles through 4 OKLCH variants — never generates black)

## Regenerate Variants

Four visually distinct OKLCH variants per suggestion:

1. Standard accent
2. Brighter + punchier
3. Darker + muted
4. Softer pastel

All stay within visible range (lightness 0.25–0.72).

---

# Step 3 — WCAG & Contrast Testing

Perform exhaustive accessibility validation.

## Contrast Dashboard

Summary cards display:

* AAA Passed
* AA Passed
* Failed Pairings

## Pairings Table

Evaluate combinations such as:

* text on background
* buttons on surfaces
* borders
* muted text
* semantic states

Each pairing includes:

* contrast ratio
* WCAG result
* pass/fail state
* live preview
* large text compatibility

## Filtering

Filter by:

* AAA
* AA
* Fail
* Approved pairings
* Ignored pairings

## User Approval System

Users can define which pairings are relevant to their interface.

Only approved pairings influence final scoring.

---

# Step 4 — Naming & Semantic Refinement

Finalize your design token system.

## Features

* Assign missing roles (full 16-role dropdown)
* Rename colors with token name input
* Generate semantic token names
* Role conflict warnings
* Token preview with adaptive text color
* Missing-role border highlighting
* Organize design tokens visually

Examples:

```txt
primary-500
surface-dark
accent-hover
success-soft
```

---

# Step 5 — Live Preview & Export

Preview the refined palette inside realistic UI components.

## Live UI Preview

Generate components such as:

* Product cards
* Buttons
* Forms
* Alerts
* Navigation
* Modals
* Badges
* Hero sections

Updates occur in real time.

## Hero Image Colorization

Preview palette colorization on hero imagery using CSS blend modes:

* `color` blend mode overlay
* `multiply` blend mode shadow
* `soft-light` blend mode wash

Each uses palette CSS custom properties (`--p-primary`, `--p-secondary`) with gradient gradients — preserving image luminance naturally.

## Before / After Comparison

Compare original and refined palettes using a draggable split component.

## Export Options

Export palettes as:

* CSS variables
* SCSS variables
* JSON design tokens
* Tailwind config
* Figma tokens

## PNG Download

Download a PNG image with:

* Rounded swatches
* HEX code, token name, and roles per color
* 9-step OKLCH tonal scale per color
* Theme-aware (dark/light background)
* 2x retina resolution

---

# Palette Analysis & Right Sidebar

The right sidebar provides advanced analysis with collapsible panels:

## Categorized Insights

Panels for:
* Visual Balance
* Practicality
* Readability

Each shows a severity-aware insight list with title, description, and severity dot.

## Color Suggestions Panel

Smart, palette DNA–driven suggestions starts open by default; other panels collapsed.

## Composite Scores

Three composite score bars:
* Practicality
* Cohesion
* Fatigue

Each bar uses `color-mix` tied to the score value for dynamic tinting.

---

# Color Modal (Unified Inspector)

Click any color to open the unified color modal with two modes:

## Edit Mode
* HEX input with inline editing (single-click, Enter/blur commits, Escape cancels)
* RGB inline editing
* HSL inline editing
* Native color picker with EyeDropper API fallback
* Role assignment
* Tonal scale (9-step OKLCH)
* Harmony colors (complementary, analogous, triadic)
* Clone and Remove actions

## Preview Mode
* Large color preview
* HEX/RGB/HSL display
* Tonal scale
* Harmony colors
* Add action (from global palette bar)

Used consistently across ColorCard, TonalEditModal, GlobalPaletteBar, and Step1PaletteBuilder.

---

# ColorCard (Unified Color + Naming Card)

A single component with `showNaming` prop:

* Drag handle (only with "Reorder" toggle)
* Preview bar (click → ColorModal)
* HEX display (span, read-only)
* Token name input (when `showNaming`)
* Role selector (full-width, collapsible dropdown)
* Missing-role warning
* Token preview with adaptive text
* Adaptive hex label color

Replaces both old ColorCard and NamingCard components.

---

# Theme Modes

Supports:

* Light UI (white track)
* Dark UI

Toggle in wizard header with separator. The interface adapts dynamically while preserving palette editing logic.

Labels: "Dark" / "Light"

---

# Tech Stack

## Frontend

* Vue 3
* Vite
* TypeScript
* TailwindCSS
* Pinia
* VueUse

## Libraries

* chroma.js (OKLCH color space)
* culori
* tinycolor2
* WCAG contrast utilities
* dnd-kit
* Motion One

---

# Design Philosophy

ChromaForge is not a random palette generator.

It is an intelligent assistant for building:

* usable interfaces
* visually harmonious systems
* accessible products
* scalable design tokens

The application prioritizes:

1. Readability
2. Accessibility
3. Visual comfort
4. Semantic clarity
5. Modern UI aesthetics
6. Production-ready design systems

---

# Design Direction

Inspired by:

* Figma
* Linear
* Raycast
* Vercel
* Material Theme Builder
* Adobe Color

The UI should feel:

* premium
* smooth
* minimal
* reactive
* modern
* highly polished

Avoid:

* clutter
* generic dashboards
* Bootstrap aesthetics
* outdated UI patterns

---

# Development

## Install

```bash
npm install
```

## Start Development Server

```bash
npm run dev
```

## Build

```bash
npm run build
```

---

# License

MIT
