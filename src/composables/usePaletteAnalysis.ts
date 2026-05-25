import { computed, ref } from 'vue'
import type { ColorEntry } from '../stores/palette'
import {
  getLuminance, getSaturation,
  getColorTemperature, getContrastRatio
} from './useColorUtils'
import chroma from 'chroma-js'

export type IssueSeverity = 'critical' | 'warning' | 'info'

export interface PaletteIssue {
  id: string
  severity: IssueSeverity
  title: string
  description: string
  suggestion: string
  affectedIds?: string[]
  quickFix?: () => void
}

export interface Suggestion {
  id: string
  hex: string
  role: string
  title: string
  explanation: string
  accessibilityImpact: string
  baseHex?: string
}

export function usePaletteAnalysis(colorsGetter: () => ColorEntry[], isDark?: () => boolean) {

  const issues = computed<PaletteIssue[]>(() => {
    const cs = colorsGetter()
    if (!cs.length) return []
    const result: PaletteIssue[] = []

    // 1. Missing light tones
    const hasLight = cs.some(c => getLuminance(c.hex) > 0.7)
    if (!hasLight) {
      result.push({
        id: 'no-light-tones',
        severity: 'warning',
        title: 'Missing Light Tones',
        description: 'No light tones detected. Light colors are essential for surfaces, backgrounds, and readability.',
        suggestion: 'Add a light background color (luminance > 0.7) such as an off-white or a tinted light surface.',
        affectedIds: [],
      })
    }

    // 2. Missing dark tones
    const hasDark = cs.some(c => getLuminance(c.hex) < 0.05)
    if (!hasDark) {
      result.push({
        id: 'no-dark-tones',
        severity: 'warning',
        title: 'Missing Dark Tones',
        description: 'No very dark tones detected. Dark backgrounds are critical for contrast and depth.',
        suggestion: 'Add a deep background or text color with luminance below 0.05.',
        affectedIds: [],
      })
    }

    // 3. Saturation variance
    const sats = cs.map(c => getSaturation(c.hex)).filter(s => !isNaN(s))
    if (sats.length > 2) {
      const max = Math.max(...sats)
      const min = Math.min(...sats)
      if (max - min > 0.7) {
        result.push({
          id: 'saturation-variance',
          severity: 'warning',
          title: 'Inconsistent Saturation',
          description: `High saturation variance (${Math.round((max - min) * 100)}%) makes the palette feel disjointed and unpredictable.`,
          suggestion: 'Try keeping saturation ranges within 50% of each other for a more cohesive feel.',
          affectedIds: [],
        })
      }
    }

    // 4. Mixed color temperatures
    const temps = cs.map(c => getColorTemperature(c.hex))
    const warmCount = temps.filter(t => t === 'warm').length
    const coolCount = temps.filter(t => t === 'cool').length
    const total = cs.length
    if (warmCount > 0 && coolCount > 0 && Math.abs(warmCount - coolCount) < total * 0.2) {
      result.push({
        id: 'mixed-temperature',
        severity: 'info',
        title: 'Mixed Color Temperatures',
        description: 'Warm and cool tones are competing equally, creating visual tension.',
        suggestion: 'Consider leaning toward one dominant temperature for a more harmonious palette.',
        affectedIds: [],
      })
    }

    // 5. Over-vibrant
    const vibrant = cs.filter(c => getSaturation(c.hex) > 0.85)
    if (vibrant.length > cs.length * 0.5) {
      result.push({
        id: 'over-vibrant',
        severity: 'warning',
        title: 'Over-Vibrant Palette',
        description: 'Too many highly saturated colors may cause eye strain and reduce readability.',
        suggestion: 'Desaturate secondary and tertiary colors by 20–40% for better visual comfort.',
        affectedIds: vibrant.map(c => c.id),
      })
    }

    // 6. Missing semantic roles
    const roles = new Set<string>(cs.flatMap(c => c.roles))
    const missing: string[] = []
    if (!roles.has('success')) missing.push('success')
    if (!roles.has('error')) missing.push('error')
    if (!roles.has('warning')) missing.push('warning')
    if (missing.length) {
      result.push({
        id: 'missing-semantics',
        severity: 'info',
        title: 'Missing Semantic Colors',
        description: `No colors assigned for: ${missing.join(', ')}. These are critical for UI feedback patterns.`,
        suggestion: 'Assign semantic roles or add dedicated colors for feedback states.',
        affectedIds: [],
      })
    }

    // 7. Accessibility issues
    const cs2 = cs
    let failCount = 0
    for (let i = 0; i < cs2.length; i++) {
      for (let j = i + 1; j < cs2.length; j++) {
        if (getContrastRatio(cs2[i].hex, cs2[j].hex) < 4.5) failCount++
      }
    }
    if (failCount > 0) {
      result.push({
        id: 'wcag-fails',
        severity: failCount > 5 ? 'critical' : 'warning',
        title: 'Accessibility Issues',
        description: `${failCount} color pair${failCount !== 1 ? 's' : ''} fail WCAG AA requirements (4.5:1 contrast ratio).`,
        suggestion: 'Review the Contrast & WCAG step to identify and fix failing pairs.',
        affectedIds: [],
      })
    }

    // 8. Too few colors
    if (cs.length < 4) {
      result.push({
        id: 'too-few',
        severity: 'info',
        title: 'Palette Too Small',
        description: 'A functional design system typically needs at least 6–8 colors.',
        suggestion: 'Add more colors including neutrals, semantic states, and surface variations.',
        affectedIds: [],
      })
    }

    return result
  })

  type ShuffleMode = 'lighter' | 'darker' | 'complement' | 'analogous' | 'split'

  const shuffleModes = ref(new Map<string, ShuffleMode>())

  function regenerateSuggestion(id: string) {
    const modes: ShuffleMode[] = ['lighter', 'darker', 'complement', 'analogous', 'split']
    const rand = modes[Math.floor(Math.random() * modes.length)]
    shuffleModes.value.set(id, rand)
  }

  function applyMode(hex: string, mode: ShuffleMode, _baseHex?: string): string {
    try {
      switch (mode) {
        case 'lighter': {
          const lum = chroma(hex).luminance()
          return lum > 0.5
            ? chroma(hex).brighten(1.5).hex().toUpperCase()
            : chroma(hex).brighten(2.5).hex().toUpperCase()
        }
        case 'darker': {
          const lum = chroma(hex).luminance()
          return lum < 0.1
            ? chroma(hex).darken(1.5).hex().toUpperCase()
            : chroma(hex).darken(2.5).hex().toUpperCase()
        }
        case 'complement': {
          const h = chroma(hex).get('hsl.h')
          return chroma(hex).set('hsl.h', (h + 180) % 360).hex().toUpperCase()
        }
        case 'analogous': {
          const h = chroma(hex).get('hsl.h')
          return chroma(hex).set('hsl.h', (h + 30) % 360).hex().toUpperCase()
        }
        case 'split': {
          const h = chroma(hex).get('hsl.h')
          return chroma(hex).set('hsl.h', (h + 150) % 360).hex().toUpperCase()
        }
        default:
          return hex.toUpperCase()
      }
    } catch {
      return hex.toUpperCase()
    }
  }

  const suggestions = computed<Suggestion[]>(() => {
    const cs = colorsGetter()
    if (!cs.length) return []
    const result: Suggestion[] = []

    const primary = cs.find(c => c.roles.includes('primary')) || cs[Math.floor(cs.length / 2)] || cs[0]
    const bg = cs.find(c => c.roles.includes('background')) || cs[0]
    const roles = new Set<string>(cs.flatMap(c => c.roles))

    // Helper: force any color toward a target hue
    function shiftHue(hex: string, targetHue: number): string {
      try {
        return chroma(hex).set('hsl.h', targetHue).hex().toUpperCase()
      } catch {
        return hex.toUpperCase()
      }
    }

    // Suggest error — ALWAYS a red color
    if (!roles.has('error')) {
      const baseHex = primary ? primary.hex : '#6366F1'
      const forcedRed = shiftHue(baseHex, 0)
      const dark = isDark ? isDark() : false
      const errMode = shuffleModes.value.get('suggest-error') || 'lighter'
      let errHex: string
      if (dark) {
        // Dark mode: bright/light red so it pops against dark backgrounds
        switch (errMode) {
          case 'lighter': errHex = chroma(forcedRed).brighten(1.8).hex().toUpperCase(); break
          case 'darker': errHex = chroma(forcedRed).brighten(0.8).hex().toUpperCase(); break
          case 'complement': errHex = chroma(forcedRed).saturate(0.3).brighten(1.2).hex().toUpperCase(); break
          case 'analogous': errHex = chroma(forcedRed).desaturate(0.3).brighten(1.2).hex().toUpperCase(); break
          default: errHex = chroma(forcedRed).set('hsl.s', 0.8).brighten(1.2).hex().toUpperCase(); break
        }
      } else {
        // Light mode: deep/dark red so it's visible against light backgrounds
        switch (errMode) {
          case 'lighter': errHex = chroma(forcedRed).darken(0.3).hex().toUpperCase(); break
          case 'darker': errHex = chroma(forcedRed).darken(1.5).hex().toUpperCase(); break
          case 'complement': errHex = chroma(forcedRed).saturate(0.3).darken(0.8).hex().toUpperCase(); break
          case 'analogous': errHex = chroma(forcedRed).desaturate(0.3).darken(0.8).hex().toUpperCase(); break
          default: errHex = chroma(forcedRed).set('hsl.s', 0.8).darken(0.5).hex().toUpperCase(); break
        }
      }
      result.push({
        id: 'suggest-error',
        hex: errHex,
        role: 'error',
        title: 'Add an Error Color',
        explanation: `A red tone derived from ${primary?.name || 'your palette'} for destructive actions and validation errors.`,
        accessibilityImpact: 'Users rely on red to identify critical issues instantly.',
        baseHex: baseHex,
      })
    }

    // Suggest success — ALWAYS a green color
    if (!roles.has('success')) {
      const baseHex = primary ? primary.hex : '#6366F1'
      const forcedGreen = shiftHue(baseHex, 120)
      const dark = isDark ? isDark() : false
      const sucMode = shuffleModes.value.get('suggest-success') || 'lighter'
      let successHex: string
      if (dark) {
        // Dark mode: bright/light green
        switch (sucMode) {
          case 'lighter': successHex = chroma(forcedGreen).brighten(1.8).hex().toUpperCase(); break
          case 'darker': successHex = chroma(forcedGreen).brighten(0.8).hex().toUpperCase(); break
          case 'complement': successHex = chroma(forcedGreen).saturate(0.3).brighten(1.2).hex().toUpperCase(); break
          case 'analogous': successHex = chroma(forcedGreen).desaturate(0.3).brighten(1.2).hex().toUpperCase(); break
          default: successHex = chroma(forcedGreen).set('hsl.s', 0.7).brighten(1.2).hex().toUpperCase(); break
        }
      } else {
        // Light mode: deep/dark green
        switch (sucMode) {
          case 'lighter': successHex = chroma(forcedGreen).darken(0.3).hex().toUpperCase(); break
          case 'darker': successHex = chroma(forcedGreen).darken(1.5).hex().toUpperCase(); break
          case 'complement': successHex = chroma(forcedGreen).saturate(0.3).darken(0.8).hex().toUpperCase(); break
          case 'analogous': successHex = chroma(forcedGreen).desaturate(0.3).darken(0.8).hex().toUpperCase(); break
          default: successHex = chroma(forcedGreen).set('hsl.s', 0.7).darken(0.5).hex().toUpperCase(); break
        }
      }
      result.push({
        id: 'suggest-success',
        hex: successHex,
        role: 'success',
        title: 'Add a Success Color',
        explanation: `A green tone derived from ${primary?.name || 'your palette'} for positive feedback and confirmation states.`,
        accessibilityImpact: 'Critical for form validation and status indicators.',
        baseHex: baseHex,
      })
    }

    // Suggest dark tone — darkened version of a random palette color
    const hasDark = cs.some(c => getLuminance(c.hex) < 0.05)
    if (!hasDark && !roles.has('neutral-dark')) {
      const baseColor = cs[Math.floor(Math.random() * cs.length)].hex
      const targetLum = Math.random() * 0.1
      let darkHex: string
      try {
        darkHex = chroma(baseColor).luminance(targetLum).hex().toUpperCase()
      } catch {
        darkHex = '#1a1a2e'
      }
      const mode = shuffleModes.value.get('suggest-dark') || 'darker'
      darkHex = applyMode(darkHex, mode)
      result.push({
        id: 'suggest-dark',
        hex: darkHex,
        role: 'neutral-dark',
        title: 'Add a Dark Tone',
        explanation: 'A deep dark color derived from your palette for backgrounds, borders, or elevated surfaces.',
        accessibilityImpact: 'Essential for contrast depth and dark mode support.',
        baseHex: baseColor,
      })
    }

    // Suggest light tone — lightened version of a random palette color
    const hasLight = cs.some(c => getLuminance(c.hex) > 0.7)
    if (!hasLight && !roles.has('neutral-light')) {
      const baseColor = cs[Math.floor(Math.random() * cs.length)].hex
      const targetLum = 0.9 + Math.random() * 0.1
      let lightHex: string
      try {
        lightHex = chroma(baseColor).luminance(targetLum).hex().toUpperCase()
      } catch {
        lightHex = '#f0f0f8'
      }
      const mode = shuffleModes.value.get('suggest-light') || 'lighter'
      lightHex = applyMode(lightHex, mode)
      result.push({
        id: 'suggest-light',
        hex: lightHex,
        role: 'neutral-light',
        title: 'Add a Light Tone',
        explanation: 'A light tone derived from your palette for surfaces, cards, and backgrounds.',
        accessibilityImpact: 'Provides clean, readable surfaces for content.',
        baseHex: baseColor,
      })
    }

    // Suggest warning — amber/orange color (matches missing-semantics issue)
    if (!roles.has('warning')) {
      const baseHex = primary ? primary.hex : '#6366F1'
      const forcedOrange = shiftHue(baseHex, 40)
      const dark = isDark ? isDark() : false
      const warnMode = shuffleModes.value.get('suggest-warning') || 'lighter'
      let warnHex: string
      if (dark) {
        switch (warnMode) {
          case 'lighter': warnHex = chroma(forcedOrange).brighten(1.8).hex().toUpperCase(); break
          case 'darker': warnHex = chroma(forcedOrange).brighten(0.8).hex().toUpperCase(); break
          case 'complement': warnHex = chroma(forcedOrange).saturate(0.3).brighten(1.2).hex().toUpperCase(); break
          case 'analogous': warnHex = chroma(forcedOrange).desaturate(0.3).brighten(1.2).hex().toUpperCase(); break
          default: warnHex = chroma(forcedOrange).set('hsl.s', 0.8).brighten(1.2).hex().toUpperCase(); break
        }
      } else {
        switch (warnMode) {
          case 'lighter': warnHex = chroma(forcedOrange).darken(0.3).hex().toUpperCase(); break
          case 'darker': warnHex = chroma(forcedOrange).darken(1.5).hex().toUpperCase(); break
          case 'complement': warnHex = chroma(forcedOrange).saturate(0.3).darken(0.8).hex().toUpperCase(); break
          case 'analogous': warnHex = chroma(forcedOrange).desaturate(0.3).darken(0.8).hex().toUpperCase(); break
          default: warnHex = chroma(forcedOrange).set('hsl.s', 0.8).darken(0.5).hex().toUpperCase(); break
        }
      }
      result.push({
        id: 'suggest-warning',
        hex: warnHex,
        role: 'warning',
        title: 'Add a Warning Color',
        explanation: 'An amber tone for cautionary states, alerts, and medium-severity feedback.',
        accessibilityImpact: 'Users rely on amber to identify warnings before they escalate.',
        baseHex: baseHex,
      })
    }

    // Suggest text color — derived from background (light bg → dark text, dark bg → light text)
    const hasTextColor = roles.has('text-primary') || roles.has('text-secondary')
    if (!hasTextColor && bg) {
      const mode = shuffleModes.value.get('suggest-text') || 'split'
      const bgLum = getLuminance(bg.hex)
      const baseText = bgLum > 0.5 ? '#374151' : '#e5e7eb'
      const textHex = applyMode(baseText, mode)
      result.push({
        id: 'suggest-text',
        hex: textHex,
        role: 'text-primary',
        title: 'Add a Text Color',
        explanation: bgLum > 0.5
          ? 'Your background is light — a dark charcoal text ensures strong readability.'
          : 'Your background is dark — a light off-white text ensures strong readability.',
        accessibilityImpact: 'Fundamental for readable content across your UI.',
        baseHex: bg.hex,
      })
    }

    return result
  })

  const healthScore = computed(() => {
    const totalIssues = issues.value.length
    const criticalCount = issues.value.filter(i => i.severity === 'critical').length
    const warningCount = issues.value.filter(i => i.severity === 'warning').length
    const baseScore = 100 - (criticalCount * 20) - (warningCount * 10) - (totalIssues * 3)
    return Math.max(0, Math.min(100, baseScore))
  })

  return { issues, suggestions, healthScore, regenerateSuggestion }
}
