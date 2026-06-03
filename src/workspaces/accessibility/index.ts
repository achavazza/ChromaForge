import { computed } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, ContrastPair } from '../../stores/palette'
import type { AnalysisFactory, PaletteInsight, PaletteIssue, Suggestion, WorkspaceScores, ColorRefinement, InsightGroup } from '../types'

function simulateCVD(hex: string, type: 'p' | 'd' | 't'): string {
  try {
    const c = chroma(hex)
    const [r, g, b] = [c.get('rgb.r'), c.get('rgb.g'), c.get('rgb.b')]
    const factors: Record<string, [number, number, number]> = {
      p: [0.625, 0.7, 0.9],
      d: [0.7, 0.625, 0.9],
      t: [0.95, 0.95, 0.5],
    }
    const f = factors[type]
    return chroma(clamp(r * f[0]), clamp(g * f[1]), clamp(b * f[2])).hex()
  } catch { return hex }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function apcaContrast(text: string, bg: string): number {
  try {
    const tc = chroma(text)
    const bc = chroma(bg)
    const lT = tc.luminance()
    const lB = bc.luminance()
    const lTp = Math.pow(lT, 0.6)
    const lBp = Math.pow(lB, 0.6)
    const contrast = (Math.max(lTp, lBp) - 0.2) / (Math.min(lTp, lBp) + 0.2)
    return Math.round(contrast * 100) / 100
  } catch { return 0 }
}

export const createAccessibilityAnalysis: AnalysisFactory = (
  colorsGetter: () => ColorEntry[],
  _isDark: () => boolean,
  contrastPairsGetter: () => ContrastPair[]
) => {
  const insights = computed<PaletteInsight[]>(() => {
    const result: PaletteInsight[] = []
    const colors = colorsGetter()
    if (colors.length < 2) return result

    const pairs = contrastPairsGetter()

    // 1. WCAG AA failures
    let aaFailCount = 0
    for (const p of pairs) {
      if (!p.wcagAA && !p.ignored) aaFailCount++
    }
    if (aaFailCount > 0) {
      result.push({
        id: 'wcag-aa',
        severity: aaFailCount > 5 ? 'critical' : 'warning',
        category: 'WCAG',
        title: 'WCAG AA failures',
        description: `${aaFailCount} pair${aaFailCount > 1 ? 's' : ''} fail${aaFailCount === 1 ? 's' : ''} WCAG AA contrast ratio (≥4.5:1).`,
      })
    }

    // 2. WCAG AAA failures
    let aaaFailCount = 0
    for (const p of pairs) {
      if (!p.wcagAAA && !p.ignored && p.foregroundId !== p.backgroundId) aaaFailCount++
    }
    if (aaaFailCount > 0) {
      result.push({
        id: 'wcag-aaa',
        severity: aaaFailCount > 10 ? 'warning' : 'info',
        category: 'WCAG',
        title: 'WCAG AAA compliance',
        description: `${aaaFailCount} pair${aaaFailCount > 1 ? 's' : ''} fail${aaaFailCount === 1 ? 's' : ''} WCAG AAA contrast (≥7:1).`,
      })
    }

    // 3. APCA scores
    const apcaValues: number[] = []
    for (const p of pairs.slice(0, 10)) {
      const fg = colors.find(c => c.id === p.foregroundId)
      const bg = colors.find(c => c.id === p.backgroundId)
      if (fg && bg && !p.ignored) {
        apcaValues.push(apcaContrast(fg.hex, bg.hex))
      }
    }
    const avgApca = apcaValues.length > 0
      ? apcaValues.reduce((a, b) => a + b, 0) / apcaValues.length
      : 0
    if (avgApca > 0) {
      result.push({
        id: 'apca-score',
        severity: avgApca < 0.3 ? 'warning' : avgApca < 0.5 ? 'info' : 'success',
        category: 'APCA',
        title: 'APCA contrast profile',
        description: `Average APCA contrast is ${(avgApca * 100).toFixed(0)}. ${avgApca < 0.3 ? 'Consider increasing contrast for readability.' : 'Readability contrast appears adequate.'}`,
      })
    }

    // 4. Color blindness safety
    for (const [cbName, cbId, simFn] of [['Protanopia', 'protanopia', (h: string) => simulateCVD(h, 'p')] as const, ['Deuteranopia', 'deuteranopia', (h: string) => simulateCVD(h, 'd')] as const]) {
      let lost = 0
      for (const p of pairs) {
        if (p.ignored || p.foregroundId === p.backgroundId) continue
        const fg = colors.find(c => c.id === p.foregroundId)
        const bg = colors.find(c => c.id === p.backgroundId)
        if (!fg || !bg) continue
        const simFg = simFn(fg.hex)
        const simBg = simFn(bg.hex)
        try {
          const cr = chroma.contrast(simFg, simBg)
          if (cr < 3.0) lost++
        } catch { /* skip */ }
      }
      if (lost > 0) {
        result.push({
          id: `cb-${cbId}`,
          severity: lost > 5 ? 'critical' : 'warning',
          category: 'color-blindness',
          title: `${cbName} concern`,
          description: `${lost} pair${lost > 1 ? 's' : ''} lose${lost === 1 ? 's' : ''} adequate contrast under ${cbName}.`,
        })
      }
    }

    // 5. Pure black/white detection
    const pureBlack = colors.find(c => c.hex.toLowerCase() === '#000000')
    const pureWhite = colors.find(c => c.hex.toLowerCase() === '#ffffff')
    if (pureBlack) {
      result.push({
        id: 'pure-black',
        severity: 'warning',
        category: 'contrast-fatigue',
        title: 'Pure black detected',
        description: 'Pure black (#000000) causes visual fatigue. Use a tinted dark instead.',
        affectedIds: [pureBlack.id],
      })
    }
    if (pureWhite) {
      result.push({
        id: 'pure-white',
        severity: 'warning',
        category: 'contrast-fatigue',
        title: 'Pure white detected',
        description: 'Pure white (#ffffff) causes eye strain. Use a tinted light instead.',
        affectedIds: [pureWhite.id],
      })
    }

    // 6. Extreme contrast pairs
    let extremeCount = 0
    for (const p of pairs) {
      if (!p.ignored && p.ratio > 18) extremeCount++
    }
    if (extremeCount > 2) {
      result.push({
        id: 'extreme-contrast',
        severity: 'info',
        category: 'contrast-fatigue',
        title: 'Extreme contrast pairs',
        description: `${extremeCount} pairs exceed 18:1 — may cause visual fatigue in long-form reading.`,
      })
    }

    return result
  })

  const issues = computed<PaletteIssue[]>(() => [])
  const suggestions = computed<Suggestion[]>(() => {
    const colors = colorsGetter()
    if (colors.length < 2) return []
    return []
  })

  const scores = computed<WorkspaceScores>(() => {
    const ins = insights.value
    const crCritical = ins.filter(i => i.severity === 'critical').length
    const crWarning = ins.filter(i => i.severity === 'warning').length
    const crInfo = ins.filter(i => i.severity === 'info').length
    const accessScore = Math.max(0, 100 - crCritical * 20 - crWarning * 10 - crInfo * 3)

    return {
      practicality: accessScore,
      cohesion: 100,
      fatigue: accessScore,
    }
  })

  const refinements = computed<ColorRefinement[]>(() => {
    return []
  })

  const insightGroups = computed<InsightGroup[]>(() => {
    const groups: Record<string, PaletteInsight[]> = {}
    for (const ins of insights.value) {
      if (!groups[ins.category]) groups[ins.category] = []
      groups[ins.category].push(ins)
    }
    const labelMap: Record<string, string> = {
      'WCAG': 'WCAG Compliance',
      'APCA': 'APCA Contrast',
      'color-blindness': 'Color Blindness',
      'contrast-fatigue': 'Contrast Fatigue',
    }
    return Object.entries(groups).map(([key, ins]) => ({
      label: labelMap[key] || key,
      key,
      insights: ins,
    }))
  })

  const topIssues = computed<PaletteInsight[]>(() =>
    insights.value.filter(i => i.severity !== 'success').slice(0, 6)
  )

  const healthScore = computed<number>(() => {
    const s = scores.value
    return Math.round((s.practicality + s.cohesion + s.fatigue) / 3)
  })

  return {
    insights,
    issues,
    suggestions,
    scores,
    refinements,
    insightGroups,
    topIssues,
    healthScore,
    cycleRefinement: () => {},
    regenerateSuggestion: () => {},
  }
}
