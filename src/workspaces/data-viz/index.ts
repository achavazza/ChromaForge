import { computed } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, ContrastPair } from '../../stores/palette'
import type { AnalysisFactory, PaletteInsight, PaletteIssue, Suggestion, WorkspaceScores, InsightGroup } from '../types'
function simulateProtanopia(hex: string): string {
  try {
    const c = chroma(hex)
    const [r, g, b] = [c.get('rgb.r'), c.get('rgb.g'), c.get('rgb.b')]
    return chroma(clamp(r * 0.625), clamp(g * 0.7), clamp(b * 0.9)).hex()
  } catch {
    return hex
  }
}

function simulateDeuteranopia(hex: string): string {
  try {
    const c = chroma(hex)
    const [r, g, b] = [c.get('rgb.r'), c.get('rgb.g'), c.get('rgb.b')]
    return chroma(r * 0.625, g * 0.7, b * 0.9).hex()
  } catch { return hex }
}

function simulateTritanopia(hex: string): string {
  try {
    const c = chroma(hex)
    const [r, g, b] = [c.get('rgb.r'), c.get('rgb.g'), c.get('rgb.b')]
    return chroma(r * 0.95, g * 0.95, b * 0.5).hex()
  } catch { return hex }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

function deltaE(hex1: string, hex2: string): number {
  try {
    return chroma.deltaE(hex1, hex2)
  } catch { return 0 }
}

function getHue(hex: string): number {
  try { return chroma(hex).get('hsl.h') } catch { return 0 }
}

function getLightness(hex: string): number {
  try { return chroma(hex).get('hsl.l') } catch { return 0 }
}

function getChroma(hex: string): number {
  try { return chroma(hex).get('lch.c') } catch { return 0 }
}

export const createDataVizAnalysis: AnalysisFactory = (
  colorsGetter: () => ColorEntry[],
  _isDark: () => boolean,
  _contrastPairsGetter: () => ContrastPair[]
) => {
  const insights = computed<PaletteInsight[]>(() => {
    const result: PaletteInsight[] = []
    const colors = colorsGetter()
    if (colors.length < 2) return result

    const hexes = colors.map(c => c.hex)

    // 1. Category Similarity — detect colors too close in hue
    const hueThreshold = 25
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const dE = deltaE(hexes[i], hexes[j])
        if (dE < 15) {
          result.push({
            id: `cat-sim-${i}-${j}`,
            severity: 'warning',
            category: 'distinguishability',
            title: 'Categories too similar',
            description: `${colors[i].name || colors[i].hex} and ${colors[j].name || colors[j].hex} may be indistinguishable (ΔE ${dE.toFixed(1)}).`,
            affectedIds: [colors[i].id, colors[j].id],
          })
        }
        const h1 = getHue(hexes[i])
        const h2 = getHue(hexes[j])
        const hueDiff = Math.min(Math.abs(h1 - h2), 360 - Math.abs(h1 - h2))
        if (hueDiff > 0 && hueDiff < hueThreshold) {
          result.push({
            id: `hue-sim-${i}-${j}`,
            severity: 'info',
            category: 'distinguishability',
            title: 'Hue proximity warning',
            description: `Hue difference between ${colors[i].name || colors[i].hex} and ${colors[j].name || colors[j].hex} is only ${Math.round(hueDiff)}°.`,
            affectedIds: [colors[i].id, colors[j].id],
          })
        }
      }
    }

    // 2. Category Capacity
    const uniqueHues = new Set(hexes.map(h => Math.round(getHue(h) / 30) * 30))
    const capacity = Math.min(uniqueHues.size * 2, 12)
    result.push({
      id: 'cat-capacity',
      severity: colors.length > capacity ? 'warning' : 'success',
      category: 'capacity',
      title: 'Category capacity',
      description: colors.length > capacity
        ? `This palette supports ${capacity} distinct categories but contains ${colors.length} colors. Some categories may be hard to distinguish.`
        : `Palette can support up to ${capacity} distinct categories comfortably.`,
    })

    // 3. Color Blind Conflicts
    const cbTypes: [string, string, (h: string) => string][] = [
      ['Protanopia', 'protanopia', simulateProtanopia],
      ['Deuteranopia', 'deuteranopia', simulateDeuteranopia],
      ['Tritanopia', 'tritanopia', simulateTritanopia],
    ]
    for (const [cbName, cbId, simFn] of cbTypes) {
      const simulated = hexes.map(h => simFn(h))
      for (let i = 0; i < colors.length; i++) {
        for (let j = i + 1; j < colors.length; j++) {
          const dE = deltaE(simulated[i], simulated[j])
          if (dE < 10) {
            result.push({
              id: `cb-${cbId}-${i}-${j}`,
              severity: 'critical',
              category: 'color-blindness',
              title: `${cbName} conflict`,
              description: `${colors[i].name || colors[i].hex} and ${colors[j].name || colors[j].hex} become indistinguishable under ${cbName} (ΔE ${dE.toFixed(1)}).`,
              affectedIds: [colors[i].id, colors[j].id],
            })
          }
        }
      }
    }

    // 4. Sequential palette detection
    const lightnessValues = hexes.map(h => getLightness(h))
    const chromaValues = hexes.map(h => getChroma(h))
    const lightnessRange = Math.max(...lightnessValues) - Math.min(...lightnessValues)
    const chromaRange = Math.max(...chromaValues) - Math.min(...chromaValues)

    if (lightnessRange > 0.4 && chromaRange < 0.15) {
      result.push({
        id: 'sequential-like',
        severity: 'info',
        category: 'sequential',
        title: 'Sequential palette detected',
        description: 'This palette has large lightness range with low chroma variation — suitable for sequential scales (heatmaps, gradients).',
      })
    } else if (lightnessRange < 0.3 && chromaRange > 0.3) {
      result.push({
        id: 'qualitative-like',
        severity: 'info',
        category: 'sequential',
        title: 'Qualitative palette detected',
        description: 'This palette has low lightness range with high chroma variation — suitable for categorical data.',
      })
    }

    return result
  })

  const issues = computed<PaletteIssue[]>(() => [])
  const suggestions = computed<Suggestion[]>(() => {
    return []
  })

  const scores = computed<WorkspaceScores>(() => {
    const ins = insights.value
    let practicality = 100
    let cohesion = 100
    let fatigue = 100

    const criticalCount = ins.filter(i => i.severity === 'critical').length
    const warningCount = ins.filter(i => i.severity === 'warning').length
    const infoCount = ins.filter(i => i.severity === 'info').length

    practicality -= criticalCount * 15 + warningCount * 8 + infoCount * 2
    cohesion -= criticalCount * 10 + warningCount * 5
    fatigue -= warningCount * 5 + infoCount * 2

    const deduped = new Set(ins.map(i => i.title)).size
    cohesion = Math.max(0, cohesion - Math.max(0, insights.value.length - deduped) * 3)

    return {
      practicality: Math.max(0, practicality),
      cohesion: Math.max(0, cohesion),
      fatigue: Math.max(0, fatigue),
    }
  })

  const insightGroups = computed<InsightGroup[]>(() => {
    const groups: Record<string, PaletteInsight[]> = {}
    for (const ins of insights.value) {
      if (!groups[ins.category]) groups[ins.category] = []
      groups[ins.category].push(ins)
    }
    const labelMap: Record<string, string> = {
      'distinguishability': 'Distinguishability',
      'capacity': 'Category Capacity',
      'color-blindness': 'Color Blindness',
      'sequential': 'Sequential Scale',
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
    refinements: computed(() => []),
    insightGroups,
    topIssues,
    healthScore,
    cycleRefinement: () => {},
    regenerateSuggestion: () => {},
  }
}
