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

ChromaForge uses a structured multi-step workflow with a persistent sidebar navigation.

### Steps

1. Palette Builder
2. Analysis & Suggestions
3. WCAG Testing
4. Naming & Semantic Roles
5. Preview & Export

---

# Step 1 — Palette Builder

Build and organize your palette visually.

## Features

* Unlimited colors
* Drag & drop reordering
* Modern color picker
* HEX editing
* Role assignment
* Duplicate/remove colors
* Import existing palettes

## Semantic Roles

Assign meaningful UI roles to each color:

* Background
* Surface
* Primary
* Secondary
* Tertiary
* Accent
* Success
* Warning
* Error
* Info
* Border
* Text Primary
* Text Secondary
* Neutral
* Neutral Light
* Neutral Dark

## Palette Import

Paste HEX values directly into a modal.

Supports:

```txt
#FFBE0B, #FB5607, #FF006E
```

or

```txt
#FFBE0B
#FB5607
#FF006E
```

Invalid values are automatically sanitized.

---

# Step 2 — Analysis & Smart Suggestions

The intelligent analysis engine continuously evaluates palette quality.

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

## Example Feedback

### Missing Light Tones

> No light tones detected. Consider adding a light color for surfaces or backgrounds.

### Inconsistent Saturation

> High saturation variance makes the palette feel disjointed.

### Over-Vibrant Palette

> Too many saturated colors may cause eye strain.

### Accessibility Issues

> 5 contrast pairs fail WCAG AA requirements.

---

# Smart Color Suggestions

ChromaForge generates contextual recommendations based on the current palette.

Suggestions include:

* Neutral systems
* Light/dark surfaces
* Semantic success/error colors
* Accessible replacements
* Softer variants
* Hover states
* Tonal bridge colors

Each suggestion card includes:

* Color preview
* Suggested role
* Explanation
* Accessibility impact
* Add button
* Shuffle button
* Manual edit option

## Shuffle Suggestions

Generate alternative compatible suggestions while preserving:

* palette harmony
* accessibility
* tonal consistency
* color temperature

---

# Step 3 — WCAG & Contrast Testing

Perform exhaustive accessibility validation.

## Contrast Dashboard

Summary cards display:

* AAA Passed
* AA Passed
* Failed Pairings

Example:

```txt
AAA → 2
AA → 3
Fail → 16
```

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

* Assign missing roles
* Rename colors
* Generate semantic token names
* Organize design tokens visually

Examples:

```txt
primary-500
surface-dark
accent-hover
success-soft
```

---

# Step 5 — Preview & Export

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

---

# Before / After Comparison

Compare:

* Original palette
* Refined palette

using a draggable before/after component.

---

# Dynamic Image Filtering

Preview how the palette affects photography and branding visuals.

Features:

* Dummy image generation
* Duotone overlays
* Hue shifts
* Saturation filters
* CSS blend modes

---

# Form State Preview

Visualize states such as:

* default
* hover
* focus
* success
* warning
* error
* disabled

---

# Export Options

Export palettes as:

* CSS variables
* Tailwind config
* JSON design tokens
* SCSS variables
* Figma tokens

---

# Shareable URLs

Palettes can be serialized directly into the URL.

Example:

```txt
/#FFBE0B-FB5607-FF006E-8338EC-3A86FF
```

The URL can preserve:

* colors
* roles
* pairings
* theme mode
* refinements

---

# Color Inspector

Click any color to open an advanced inspector panel.

## Includes

* HEX
* RGB
* HSL
* OKLCH
* Luminance
* Contrast data
* Accessibility notes

## Generated Relationships

* Complementary
* Analogous
* Triadic
* Split complementary
* Monochromatic variants

---

# Theme Modes

Supports:

* Light UI
* Dark UI

The interface adapts dynamically while preserving palette editing logic.

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

* chroma.js
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

# Future Ideas

Potential future features:

* AI palette generation
* Mood-based systems
* Brand personality presets
* Color blindness simulation
* Screenshot palette extraction
* Typography pairing
* Auto-generated hover states
* Design token pipelines
* Multi-brand support
* Team collaboration
* Figma plugin
* Tailwind plugin

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

---

# ChromaForge

Forge better color systems.
