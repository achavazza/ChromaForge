import { computed, ref } from 'vue'
import type { ColorEntry, ContrastPair } from '../stores/palette'
import {
  getLuminance, getSaturation,
  getColorTemperature, getContrastRatio,
  computePaletteDNA, deriveSemanticColor, generatePaletteNeutral
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

const SEMANTIC_RANGES: Record<string, [number, number]> = {
  'error': [0, 25],
  'success': [130, 170],
  'warning': [70, 100],
  'info': [220, 260],
}

export function usePaletteAnalysis(colorsGetter: () => ColorEntry[], isDark?: () => boolean, contrastPairsGetter?: () => ContrastPair[]) {

  const issues = computed<PaletteIssue[]>(() => {
    const cs = colorsGetter()
    if (!cs.length) return []
    const result: PaletteIssue[] = []

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

    const cs2 = cs
    const pairs = contrastPairsGetter?.() ?? []
    const approved = pairs.filter(p => p.approved)
    let failCount = 0
    if (approved.length > 0) {
      failCount = approved.filter(p => !p.wcagAA).length
    } else {
      for (let i = 0; i < cs2.length; i++) {
        for (let j = i + 1; j < cs2.length; j++) {
          if (getContrastRatio(cs2[i].hex, cs2[j].hex) < 4.5) failCount++
        }
      }
    }
    if (failCount > 0) {
      result.push({
        id: 'wcag-fails',
        severity: failCount > 5 ? 'critical' : 'warning',
        title: 'Accessibility Issues',
        description: `${failCount} relevant color pair${failCount !== 1 ? 's' : ''} fail WCAG AA requirements (4.5:1 contrast ratio).`,
        suggestion: 'Review the Contrast & WCAG step to identify and fix failing pairs.',
        affectedIds: [],
      })
    }

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

  const suggestionVariants = ref(new Map<string, number>())
  const VARIANT_COUNT = 4

  function regenerateSuggestion(id: string) {
    const current = suggestionVariants.value.get(id) || 0
    suggestionVariants.value.set(id, (current + 1) % VARIANT_COUNT)
  }

  function applyVariant(hex: string, variantIdx: number): string {
    if (variantIdx === 0) return hex
    try {
      const [l, c, h] = chroma(hex).oklch()
      switch (variantIdx) {
        case 1: return chroma.oklch(Math.min(0.72, l + 0.12), Math.min(0.38, c * 1.35), h).hex().toUpperCase()
        case 2: return chroma.oklch(Math.max(0.25, l - 0.10), Math.max(0.03, c * 0.65), h).hex().toUpperCase()
        case 3: return chroma.oklch(Math.min(0.65, l + 0.07), Math.max(0.02, c * 0.5), h).hex().toUpperCase()
        default: return hex
      }
    } catch { return hex }
  }

  const suggestions = computed<Suggestion[]>(() => {
    const cs = colorsGetter()
    if (!cs.length) return []
    const result: Suggestion[] = []
    const dna = computePaletteDNA(cs)
    const mode: 'dark' | 'light' = (isDark ? isDark() : false) ? 'dark' : 'light'
    const roles = new Set<string>(cs.flatMap(c => c.roles))

    const semanticSuggestions: Array<{ id: string, role: string, title: string, explanation: string, impact: string }> = [
      { id: 'suggest-error', role: 'error', title: 'Add an Error Color', explanation: 'A red tone preserving palette character for destructive actions and validation errors.', impact: 'Users rely on red to identify critical issues instantly.' },
      { id: 'suggest-success', role: 'success', title: 'Add a Success Color', explanation: 'A green tone preserving palette DNA for positive feedback and confirmation states.', impact: 'Critical for form validation and status indicators.' },
      { id: 'suggest-warning', role: 'warning', title: 'Add a Warning Color', explanation: 'An amber tone preserving palette character for cautionary states and alerts.', impact: 'Users rely on amber to identify warnings before they escalate.' },
      { id: 'suggest-info', role: 'info', title: 'Add an Info Color', explanation: 'A blue tone preserving palette DNA for informational states and notifications.', impact: 'Essential for system messages and help cues.' },
    ]

    for (const s of semanticSuggestions) {
      if (!roles.has(s.role as any)) {
        const range = SEMANTIC_RANGES[s.role]
        const variantIdx = suggestionVariants.value.get(s.id) || 0
        const hex = applyVariant(deriveSemanticColor(dna, range[0], range[1], mode, 'accent'), variantIdx)
        result.push({ id: s.id, hex, role: s.role, title: s.title, explanation: s.explanation, accessibilityImpact: s.impact })
      }
    }

    const hasDark = cs.some(c => getLuminance(c.hex) < 0.05)
    if (!hasDark && !roles.has('neutral-dark')) {
      const hex = generatePaletteNeutral(dna, 0.04, 0.12)
      result.push({
        id: 'suggest-dark',
        hex,
        role: 'neutral-dark',
        title: 'Add a Dark Tone',
        explanation: 'A deep dark color tinted with palette hue for backgrounds, borders, or elevated surfaces.',
        accessibilityImpact: 'Essential for contrast depth and dark mode support.',
      })
    }

    const hasLight = cs.some(c => getLuminance(c.hex) > 0.7)
    if (!hasLight && !roles.has('neutral-light')) {
      const hex = generatePaletteNeutral(dna, 0.93, 0.08)
      result.push({
        id: 'suggest-light',
        hex,
        role: 'neutral-light',
        title: 'Add a Light Tone',
        explanation: 'A light tone tinted with palette hue for surfaces, cards, and backgrounds.',
        accessibilityImpact: 'Provides clean, readable surfaces for content.',
      })
    }

    const hasTextColor = roles.has('text-primary') || roles.has('text-secondary')
    const primary = cs.find(c => c.roles.includes('primary')) || cs[0]
    if (!hasTextColor && primary) {
      const bg = cs.find(c => c.roles.includes('background')) || cs[0]
      const bgLum = getLuminance(bg?.hex || '#ffffff')
      const textLum = bgLum > 0.5 ? 0.12 : 0.88
      const textChroma = dna.averageChroma * 0.05
      const textHue = dna.dominantHue
      const textHex = chroma.oklch(textLum, Math.max(0.01, textChroma), textHue).hex().toUpperCase()
      result.push({
        id: 'suggest-text',
        hex: textHex,
        role: 'text-primary',
        title: 'Add a Text Color',
        explanation: bgLum > 0.5
          ? 'Your background is light — a palette-tinted dark text ensures strong readability.'
          : 'Your background is dark — a palette-tinted light text ensures strong readability.',
        accessibilityImpact: 'Fundamental for readable content across your UI.',
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
