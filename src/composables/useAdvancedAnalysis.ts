import { computed, ref } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, ContrastPair } from '../stores/palette'

export type InsightSeverity = 'critical' | 'warning' | 'info' | 'success'

export interface PaletteInsight {
  id: string
  title: string
  description: string
  severity: InsightSeverity
  category: 'saturation' | 'hue' | 'tonal' | 'semantic' | 'accessibility' | 'readiness' | 'score'
}

export interface InsightGroup {
  label: string
  insights: PaletteInsight[]
}

export interface PaletteScores {
  practicality: number
  cohesion: number
  fatigue: number
}

export interface ColorRefinement {
  colorId: string
  currentHex: string
  suggestedHex: string
  title: string
  explanation: string
  rationale: string
  huePreserved: boolean
  chromaReduction: number
}

export function useAdvancedAnalysis(
  colorsGetter: () => ColorEntry[],
  isDark?: () => boolean,
  contrastPairsGetter?: () => ContrastPair[]
) {
  const colors = computed(() => colorsGetter())
  const darkMode = computed(() => isDark?.() ?? false)
  const contrastPairs = computed(() => contrastPairsGetter?.() ?? [])

  const insights = computed<PaletteInsight[]>(() => {
    const result: PaletteInsight[] = []
    const cs = colors.value
    if (!cs.length) return result

    const hexes = cs.map(c => c.hex)

    // ── 1. Saturation Excess ──────────────────────────────
    const saturations = hexes.map(h => chroma(h).get('hsl.s'))
    const highSat = saturations.filter(s => s > 0.8)
    if (highSat.length >= 3) {
      result.push({
        id: 'sat-excess',
        title: 'Excessive saturation',
        description: `${highSat.length} colors exceed 80% saturation. Too many intense colors compete for attention and cause eye strain.`,
        severity: highSat.length >= 5 ? 'critical' : 'warning',
        category: 'saturation',
      })
    }

    // ── 2. Pure Black ─────────────────────────────────────
    if (hexes.some(h => h.toUpperCase() === '#000000')) {
      result.push({
        id: 'pure-black',
        title: 'Pure black detected',
        description: 'Pure black (#000000) creates excessive contrast and visual fatigue. Use softer dark tones like #0F1115 or #121212 instead.',
        severity: 'warning',
        category: 'accessibility',
      })
    }

    // ── 3. Pure White ─────────────────────────────────────
    if (hexes.some(h => h.toUpperCase() === '#FFFFFF')) {
      result.push({
        id: 'pure-white',
        title: 'Pure white detected',
        description: 'Pure white (#FFFFFF) causes glare and eye fatigue. Use softer off-whites like #FAFAFA or #F5F5F5 for comfortable UI backgrounds.',
        severity: 'warning',
        category: 'accessibility',
      })
    }

    // ── 4. Saturation Variance ────────────────────────────
    if (saturations.length >= 3) {
      const mean = saturations.reduce((a, b) => a + b, 0) / saturations.length
      const variance = saturations.reduce((sum, s) => sum + (s - mean) ** 2, 0) / saturations.length
      const stdDev = Math.sqrt(variance)
      if (stdDev > 0.35) {
        result.push({
          id: 'sat-variance',
          title: 'Uneven saturation',
          description: `Saturation varies widely (σ=${stdDev.toFixed(2)}). Some colors feel vivid while others look muddy, breaking palette consistency.`,
          severity: 'warning',
          category: 'saturation',
        })
      }
    }

    // ── 5. Hue Clustering ─────────────────────────────────
    if (hexes.length >= 3) {
      const hues = hexes.map(h => {
        const hue = chroma(h).get('hsl.h')
        return isNaN(hue) ? 0 : hue
      })
      const sorted = [...hues].sort((a, b) => a - b)
      let maxGap = 0
      for (let i = 1; i < sorted.length; i++) {
        maxGap = Math.max(maxGap, sorted[i] - sorted[i - 1])
      }
      const range = sorted[sorted.length - 1] - sorted[0]
      if (range < 60 && hexes.length >= 3) {
        result.push({
          id: 'hue-cluster',
          title: 'Hues too similar',
          description: `All colors cluster within ${range.toFixed(0)}° on the hue wheel. This limits semantic differentiation and visual hierarchy.`,
          severity: 'warning',
          category: 'hue',
        })
      }
    }

    // ── 6. Temperature Conflict ───────────────────────────
    const warm = hexes.filter(h => getTemperature(h) === 'warm')
    const cool = hexes.filter(h => getTemperature(h) === 'cool')
    if (warm.length >= 2 && cool.length >= 2) {
      const warmSat = warm.map(h => chroma(h).get('hsl.s'))
      const coolSat = cool.map(h => chroma(h).get('hsl.s'))
      const avgWarmSat = warmSat.reduce((a, b) => a + b, 0) / warmSat.length
      const avgCoolSat = coolSat.reduce((a, b) => a + b, 0) / coolSat.length
      if (avgWarmSat > 0.6 && avgCoolSat > 0.6) {
        result.push({
          id: 'temp-conflict',
          title: 'Warm/cool conflict',
          description: `Vibrant warm and cool colors compete (avg saturation ${(avgWarmSat * 100).toFixed(0)}% vs ${(avgCoolSat * 100).toFixed(0)}%). Consider reducing intensity on one side for harmony.`,
          severity: 'warning',
          category: 'hue',
        })
      }
    }

    // ── 7. Lack of Neutrals ──────────────────────────────
    const roleNeutrals = cs.filter(c => c.roles.some(r => ['neutral', 'neutral-light', 'neutral-dark', 'muted', 'border', 'surface', 'background'].includes(r)))
    const actualNeutrals = hexes.filter(h => chroma(h).get('hsl.s') < 0.15)
    if (roleNeutrals.length < 2 && actualNeutrals.length < 2 && hexes.length >= 3) {
      result.push({
        id: 'no-neutrals',
        title: 'Missing neutral tones',
        description: 'All colors are highly saturated. Without neutral tones (grays, muted colors), there is no visual resting point for UI layouts.',
        severity: 'critical',
        category: 'tonal',
      })
    }

    // ── 8. Lack of Tonal Scale ───────────────────────────
    const hasScale = ['100', '200', '300', '400', '500'].some(suffix =>
      cs.some(c => c.name?.includes(suffix))
    )
    const roleCounts = new Map<string, number>()
    cs.forEach(c => c.roles.forEach(r => roleCounts.set(r, (roleCounts.get(r) || 0) + 1)))
    const hasMultipleOfSameRole = [...roleCounts.values()].some(c => c > 1)
    if (!hasScale && !hasMultipleOfSameRole) {
      result.push({
        id: 'no-tonal-scale',
        title: 'No tonal variants',
        description: 'Colors lack lighter/darker variants (100–900 scale). This makes hover, focus, and disabled states impossible to implement.',
        severity: 'info',
        category: 'tonal',
      })
    }

    // ── 9. Colors Too Close ──────────────────────────────
    for (let i = 0; i < hexes.length; i++) {
      for (let j = i + 1; j < hexes.length; j++) {
        const dist = chroma.deltaE(hexes[i], hexes[j])
        if (dist < 10 && hexes[i].toUpperCase() !== hexes[j].toUpperCase()) {
          result.push({
            id: `close-colors-${i}-${j}`,
            title: 'Near-duplicate colors',
            description: `"${shortHex(hexes[i])}" and "${shortHex(hexes[j])}" are perceptually very close (ΔE=${dist.toFixed(1)}). Consider merging or increasing differentiation.`,
            severity: 'info',
            category: 'tonal',
          })
        }
      }
    }

    // ── 10. Startup Syndrome (all electric) ──────────────
    const electric = hexes.filter(h => {
      const s = chroma(h).get('hsl.s')
      const l = chroma(h).get('hsl.l')
      return s > 0.7 && l > 0.4 && l < 0.7
    })
    if (electric.length >= hexes.length * 0.6 && hexes.length >= 3) {
      result.push({
        id: 'startup-syndrome',
        title: 'Palette is too "electric"',
        description: `Most colors (${electric.length}/${hexes.length}) are ultra-saturated mid-tones. This creates a loud, gaming-like aesthetic unsuitable for professional UI.`,
        severity: 'warning',
        category: 'saturation',
      })
    }

    // ── 11. Corporate Gray Death (all gray) ──────────────
    const gray = hexes.filter(h => chroma(h).get('hsl.s') < 0.05)
    if (gray.length >= hexes.length * 0.7 && hexes.length >= 3) {
      result.push({
        id: 'gray-death',
        title: 'Palette is too muted',
        description: `Over ${gray.length}/${hexes.length} colors are essentially grayscale. The palette lacks personality—consider introducing an accent with some chroma.`,
        severity: 'info',
        category: 'saturation',
      })
    }

    // ── 12. Accent Dominance ─────────────────────────────
    const accentRoles = ['primary', 'secondary', 'accent', 'accent-hover', 'success', 'warning', 'error']
    const accentCount = cs.filter(c => c.roles.some(r => accentRoles.includes(r))).length
    const neutralRoles = ['background', 'surface', 'border', 'muted', 'neutral', 'text-primary', 'text-secondary']
    const neutralCount = cs.filter(c => c.roles.some(r => neutralRoles.includes(r))).length
    if (accentCount > neutralCount * 2 && neutralCount > 0) {
      result.push({
        id: 'accent-dominance',
        title: 'Accent colors dominate',
        description: `${accentCount} accent colors vs ${neutralCount} neutrals. Too many accent roles assigned relative to structural/background roles.`,
        severity: 'warning',
        category: 'semantic',
      })
    }

    // ── 13. Dark Mode Readiness ──────────────────────────
    const foregroundRoles = ['text-primary', 'text-secondary', 'muted', 'border', 'error', 'success', 'warning', 'info']
    const weakAccents = cs.filter(c => {
      const role = c.roles[0]
      if (!role || !foregroundRoles.includes(role)) return false
      const bg = cs.find(x => x.roles.includes('background'))
      if (!bg) return false
      const cr = chroma.contrast(c.hex, bg.hex)
      return cr < 3
    })
    if (weakAccents.length > 0) {
      const modeLabel = darkMode.value ? 'dark' : 'light'
      const modeLabel2 = darkMode.value ? 'lightening' : 'darkening'
      result.push({
        id: darkMode.value ? 'dark-readiness' : 'light-readiness',
        title: `Low contrast in ${modeLabel} mode`,
        description: `${weakAccents.length} foreground color${weakAccents.length > 1 ? 's' : ''} lack contrast against the ${modeLabel} background (contrast < 3:1). Consider ${modeLabel2} them for better readability.`,
        severity: 'warning',
        category: 'readiness',
      })
    }

    // ── 14. Token Completeness ───────────────────────────
    const roleSet = new Set(cs.flatMap(c => c.roles))
    const missingTokens: string[] = []
    if (!roleSet.has('background')) missingTokens.push('background')
    if (!roleSet.has('text-primary')) missingTokens.push('text-primary')
    if (!roleSet.has('primary')) missingTokens.push('primary')
    if (missingTokens.length > 0) {
      result.push({
        id: 'missing-tokens',
        title: 'Missing essential roles',
        description: `Missing: ${missingTokens.join(', ')}. These semantic tokens are critical for a functional design system.`,
        severity: 'critical',
        category: 'semantic',
      })
    }

    // ── 15. Approved pairings that fail WCAG ─────────────
    const approved = contrastPairs.value.filter(p => p.approved)
    if (approved.length > 0) {
      const failing = approved.filter(p => !p.wcagAA)
      if (failing.length > 0) {
        result.push({
          id: 'approved-fail',
          title: 'Approved pairings fail contrast',
          description: `${failing.length}/${approved.length} relevant pairings fail WCAG AA. Marking them as relevant won't fix contrast — consider adjusting those colors.`,
          severity: failing.length >= approved.length * 0.5 ? 'critical' : 'warning',
          category: 'accessibility',
        })
      }
    }

    // ── 16. Hierarchy Problems (all colors same weight) ──
    if (hexes.length >= 3) {
      const luminances = hexes.map(h => chroma(h).luminance())
      const lMean = luminances.reduce((a, b) => a + b, 0) / luminances.length
      const lVariance = luminances.reduce((sum, l) => sum + (l - lMean) ** 2, 0) / luminances.length
      if (lVariance < 0.02) {
        result.push({
          id: 'flat-hierarchy',
          title: 'All colors have similar weight',
          description: `Colors have nearly identical luminance (variance=${lVariance.toFixed(4)}). This creates a flat UI with no visual hierarchy or depth.`,
          severity: 'warning',
          category: 'tonal',
        })
      }
    }

    return result
  })

  // ── Composite Scores ─────────────────────────────────

  const scores = computed<PaletteScores>(() => {
    const cs = colors.value
    const hexes = cs.map(c => c.hex)
    let practicality = 100
    let cohesion = 100
    let fatigue = 100

    if (!cs.length) return { practicality: 0, cohesion: 0, fatigue: 0 }

    // Practicality: can this palette actually be used in UI?
    const roleSet = new Set(cs.flatMap(c => c.roles))
    if (!roleSet.has('background')) practicality -= 15
    if (!roleSet.has('text-primary')) practicality -= 15
    if (!roleSet.has('primary')) practicality -= 10
    const neutralsCount = hexes.filter(h => chroma(h).get('hsl.s') < 0.15).length
    if (neutralsCount < 2) practicality -= 15
    const luminances = hexes.map(h => chroma(h).luminance())
    const lRange = Math.max(...luminances) - Math.min(...luminances)
    if (lRange < 0.1) practicality -= 15

    // Cohesion: do colors work well together?
    if (hexes.length >= 2) {
      const deltas: number[] = []
      for (let i = 0; i < hexes.length; i++) {
        for (let j = i + 1; j < hexes.length; j++) {
          deltas.push(chroma.deltaE(hexes[i], hexes[j]))
        }
      }
      const avgDelta = deltas.reduce((a, b) => a + b, 0) / deltas.length
      if (avgDelta < 20) cohesion -= 20
      if (avgDelta > 80) cohesion -= 15
    }
    const saturations = hexes.map(h => chroma(h).get('hsl.s'))
    const satMean = saturations.reduce((a, b) => a + b, 0) / saturations.length
    const satVariance = saturations.reduce((sum, s) => sum + (s - satMean) ** 2, 0) / saturations.length
    if (satVariance > 0.1) cohesion -= 10

    // Fatigue: will this cause eye strain?
    const highSat = saturations.filter(s => s > 0.8).length
    fatigue -= highSat * 8
    const hasPureBlack = hexes.some(h => h.toUpperCase() === '#000000')
    if (hasPureBlack) fatigue -= 12
    const hasPureWhite = hexes.some(h => h.toUpperCase() === '#FFFFFF')
    if (hasPureWhite) fatigue -= 8
    if (lRange > 0.8) fatigue -= 10
    const extremeRatios = hexes.filter(h => {
      const l = chroma(h).luminance()
      return l < 0.02 || l > 0.95
    }).length
    fatigue -= extremeRatios * 5

    // Approved pairings factor
    const approved = contrastPairs.value.filter(p => p.approved)
    if (approved.length > 0) {
      const failing = approved.filter(p => !p.wcagAA)
      const passing = approved.filter(p => p.wcagAA)
      const failRatio = failing.length / approved.length
      const extremePairs = approved.filter(p => p.ratio > 12 || p.ratio < 2).length

      // Failing approved pairs hurts Practicality
      practicality -= Math.round(failRatio * 20)
      // All approved pass AA → bonus
      if (failRatio === 0) practicality += 10

      // Fatigue: extreme ratio pairs hurt; many passing pairs help
      fatigue -= Math.round((extremePairs / approved.length) * 10)
      if (passing.length >= approved.length * 0.8) fatigue += 8
    }

    return {
      practicality: Math.max(0, practicality),
      cohesion: Math.max(0, cohesion),
      fatigue: Math.max(0, fatigue),
    }
  })

  // ── Refinements: over-saturated color suggestions ────

  const refinementVariants = ref(new Map<string, number>())
  const REFINEMENT_VARIANT_COUNT = 5

  function computeRefinementHex(hex: string, variant: number, meanSat: number): string {
    try {
      const [l, , h] = chroma(hex).oklch()
      const targetChroma = meanSat * 0.28
      switch (variant) {
        case 0: return buildOKLCH(l, targetChroma, h)
        case 1: return buildOKLCH(Math.min(l + 0.06, 0.72), targetChroma * 0.85, h)
        case 2: return buildOKLCH(Math.max(l - 0.04, 0.25), targetChroma * 1.1, h)
        case 3: return buildOKLCH(Math.min(l + 0.1, 0.75), targetChroma * 0.6, h)
        case 4: return buildOKLCH(l, targetChroma * 0.5, h)
        default: return buildOKLCH(l, targetChroma, h)
      }
    } catch { return hex }
  }

  const refinements = computed<ColorRefinement[]>(() => {
    const cs = colors.value
    if (cs.length < 2) return []
    const hexes = cs.map(c => c.hex)
    const chromas = hexes.map(h => chroma(h).get('oklch.c'))
    const chromaMean = chromas.reduce((a, b) => a + b, 0) / chromas.length

    const result: ColorRefinement[] = []
    for (let i = 0; i < cs.length; i++) {
      const ch = chromas[i]
      if (ch > chromaMean * 2 && ch > 0.08) {
        const variantIdx = refinementVariants.value.get(cs[i].id) || 0
        const suggestedHex = computeRefinementHex(cs[i].hex, variantIdx, chromaMean * 2.5)
        const chromaBefore = chroma(cs[i].hex).get('oklch.c')
        const chromaAfter = chroma(suggestedHex).get('oklch.c')
        const hueBefore = (chroma(cs[i].hex).get('oklch.h') || 0 + 360) % 360
        const hueAfter = (chroma(suggestedHex).get('oklch.h') || 0 + 360) % 360
        result.push({
          colorId: cs[i].id,
          currentHex: cs[i].hex,
          suggestedHex,
          title: `${cs[i].name || 'Color'} is over-saturated`,
          explanation: `This color is ${Math.round((ch / chromaMean) * 100)}% more vivid than the palette average, creating visual tension.`,
          rationale: `The refined version preserves hue identity (${Math.round(hueBefore)}° → ${Math.round(hueAfter)}°) while reducing chroma by ${Math.round((1 - chromaAfter / chromaBefore) * 100)}% to harmonize with the rest of the palette.`,
          huePreserved: Math.abs(hueBefore - hueAfter) < 15 || Math.abs(hueBefore - hueAfter) > 345,
          chromaReduction: Math.round(Math.max(0, 1 - chromaAfter / chromaBefore) * 100),
        })
      }
    }
    return result
  })

  function cycleRefinement(colorId: string) {
    const current = refinementVariants.value.get(colorId) || 0
    refinementVariants.value.set(colorId, (current + 1) % REFINEMENT_VARIANT_COUNT)
  }

  // ── Summaries for the sidebar ────────────────────────

  const topIssues = computed(() => insights.value.filter(i => i.severity !== 'success').slice(0, 6))

  const insightGroups = computed<InsightGroup[]>(() => {
    const groups: Record<string, PaletteInsight[]> = {
      saturation: [],
      hue: [],
      tonal: [],
      semantic: [],
      accessibility: [],
      readiness: [],
      score: [],
    }
    insights.value.forEach(i => groups[i.category]?.push(i))
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([key, items]) => ({
        label: categoryLabel(key),
        insights: items,
      }))
  })

  return {
    insights,
    scores,
    topIssues,
    insightGroups,
    refinements,
    cycleRefinement,
  }
}

function getTemperature(hex: string): 'warm' | 'cool' | 'neutral' {
  const h = chroma(hex).get('hsl.h')
  if (isNaN(h)) return 'neutral'
  return (h >= 0 && h < 30) || (h >= 330 && h <= 360) || (h >= 30 && h < 90)
    ? 'warm'
    : (h >= 90 && h < 270) ? 'cool' : 'neutral'
}

function shortHex(hex: string): string {
  return hex.length > 9 ? hex.slice(0, 9) + '…' : hex
}

function buildOKLCH(l: number, c: number, h: number): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    try { return chroma.oklch(l, c, h).hex().toUpperCase() }
    catch { c *= 0.85 }
  }
  const gray = Math.round(Math.max(0, Math.min(1, l)) * 255)
  return `#${gray.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase()
}

function categoryLabel(key: string): string {
  const labels: Record<string, string> = {
    saturation: 'Saturation & Intensity',
    hue: 'Hue & Temperature',
    tonal: 'Tonal & Scale',
    semantic: 'Semantic & Roles',
    accessibility: 'Accessibility',
    readiness: 'Mode Readiness',
    score: 'Composite Scores',
  }
  return labels[key] || key
}
