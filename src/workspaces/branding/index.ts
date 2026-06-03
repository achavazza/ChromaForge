import { computed } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, ContrastPair } from '../../stores/palette'
import type { AnalysisFactory, PaletteInsight, PaletteIssue, Suggestion, WorkspaceScores, ColorRefinement, InsightGroup } from '../types'
import { getColorTemperature } from '../../composables/useColorUtils'

function getHue(hex: string): number {
  try { return chroma(hex).get('hsl.h') } catch { return 0 }
}

function getSat(hex: string): number {
  try { return chroma(hex).get('hsl.s') } catch { return 0 }
}

function getLightness(hex: string): number {
  try { return chroma(hex).get('hsl.l') } catch { return 0 }
}

function getChroma(hex: string): number {
  try { return chroma(hex).get('lch.c') } catch { return 0 }
}

export const createBrandingAnalysis: AnalysisFactory = (
  colorsGetter: () => ColorEntry[],
  _isDark: () => boolean,
  _contrastPairsGetter: () => ContrastPair[]
) => {
  const insights = computed<PaletteInsight[]>(() => {
    const result: PaletteInsight[] = []
    const colors = colorsGetter()
    if (colors.length < 2) return result

    const hexes = colors.map(c => c.hex)

    // 1. Emotional Tone analysis
    const temps = hexes.map(h => getColorTemperature(h))
    const warmCount = temps.filter(t => t === 'warm').length
    const coolCount = temps.filter(t => t === 'cool').length
    const neutralCount = temps.filter(t => t === 'neutral').length
    const warmRatio = warmCount / colors.length
    const coolRatio = coolCount / colors.length

    let tone: string
    let toneDesc: string
    if (warmRatio > 0.6) {
      tone = 'Warm'
      toneDesc = 'Energetic, passionate, approachable'
    } else if (coolRatio > 0.6) {
      tone = 'Cool'
      toneDesc = 'Professional, calm, trustworthy'
    } else if (warmRatio > 0.3 && coolRatio > 0.3) {
      tone = 'Balanced'
      toneDesc = 'Versatile, dynamic, inclusive'
    } else {
      tone = 'Neutral-leaning'
      toneDesc = 'Subtle, sophisticated, understated'
    }

    result.push({
      id: 'emotional-tone',
      severity: 'info',
      category: 'tone',
      title: `${tone} palette`,
      description: toneDesc,
    })

    // 2. Saturation Profile
    const sats = hexes.map(h => getSat(h))
    const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length
    const vibrancy = avgSat

    let satProfile: string
    if (vibrancy > 0.7) {
      satProfile = 'Vibrant'
    } else if (vibrancy < 0.3) {
      satProfile = 'Muted'
    } else {
      satProfile = 'Mixed'
    }

    result.push({
      id: 'saturation-profile',
      severity: 'info',
      category: 'saturation',
      title: `${satProfile} palette`,
      description: satProfile === 'Vibrant'
        ? 'High-impact, bold, attention-grabbing'
        : satProfile === 'Muted'
          ? 'Subtle, refined, easy on the eyes'
          : 'Balanced range of muted and saturated tones',
    })

    // 3. Cohesion
    const hues = hexes.map(h => getHue(h))
    const hueSpread = Math.max(...hues) - Math.min(...hues)
    const chromas = hexes.map(h => getChroma(h))
    const chromaSpread = Math.max(...chromas) - Math.min(...chromas)

    let cohesion: string
    let cohesionDesc: string
    if (hueSpread < 60 && chromaSpread < 0.2) {
      cohesion = 'Tightly cohesive'
      cohesionDesc = 'Very unified — colors feel like a deliberate set'
    } else if (hueSpread > 180) {
      cohesion = 'Complementary'
      cohesionDesc = 'High contrast palette — energetically balanced'
    } else {
      cohesion = 'Moderately cohesive'
      cohesionDesc = 'Good range with a coherent feel'
    }

    result.push({
      id: 'cohesion',
      severity: 'info',
      category: 'cohesion',
      title: cohesion,
      description: cohesionDesc,
    })

    // 4. Personality description
    const brightness = hexes.map(h => getLightness(h))
    const avgBrightness = brightness.reduce((a, b) => a + b, 0) / brightness.length

    const traits: string[] = []
    if (warmRatio > 0.5) traits.push('warm')
    if (coolRatio > 0.5) traits.push('cool')
    if (avgSat > 0.6) traits.push('vibrant')
    if (avgSat < 0.4) traits.push('restrained')
    if (avgBrightness > 0.6) traits.push('bright')
    if (avgBrightness < 0.4) traits.push('deep')
    if (neutralCount > colors.length * 0.4) traits.push('neutral-based')
    if (hueSpread > 150) traits.push('colorful')

    let personality = ''
    if (traits.includes('warm') && traits.includes('vibrant')) personality = 'Energetic and passionate'
    else if (traits.includes('cool') && traits.includes('vibrant')) personality = 'Modern and bold'
    else if (traits.includes('cool') && traits.includes('restrained')) personality = 'Professional and trustworthy'
    else if (traits.includes('warm') && traits.includes('restrained')) personality = 'Approachable and refined'
    else if (traits.includes('neutral-based') && traits.includes('bright')) personality = 'Clean and minimal'
    else if (traits.includes('neutral-based') && traits.includes('deep')) personality = 'Sophisticated and premium'
    else if (traits.includes('colorful') && traits.includes('vibrant')) personality = 'Playful and creative'
    else personality = `A ${traits.join(', ')} palette`

    result.push({
      id: 'personality',
      severity: 'info',
      category: 'personality',
      title: personality,
      description: `This palette feels ${traits.join(', ')}.`,
    })

    return result
  })

  const issues = computed<PaletteIssue[]>(() => [])
  const suggestions = computed<Suggestion[]>(() => {
    const colors = colorsGetter()
    if (colors.length < 2) return []
    return []
  })

  const scores = computed<WorkspaceScores>(() => {
    const colors = colorsGetter()
    const hexes = colors.map(c => c.hex)
    const temps = hexes.map(h => getColorTemperature(h))
    const sats = hexes.map(h => getSat(h))

    const warmRatio = temps.filter(t => t === 'warm').length / colors.length
    const coolRatio = temps.filter(t => t === 'cool').length / colors.length
    const avgSat = sats.reduce((a, b) => a + b, 0) / sats.length
    const satVariance = Math.sqrt(sats.map(s => Math.pow(s - avgSat, 2)).reduce((a, b) => a + b, 0) / sats.length)

    const emotionalClarity = Math.abs(warmRatio - coolRatio) > 0.3 ? 100 : 60
    const saturationCohesion = satVariance < 0.15 ? 90 : 70

    return {
      practicality: Math.round(emotionalClarity * 0.6 + saturationCohesion * 0.4),
      cohesion: Math.round(Math.max(0, 100 - satVariance * 100)),
      fatigue: 100,
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
      'tone': 'Emotional Tone',
      'saturation': 'Saturation Profile',
      'cohesion': 'Cohesion',
      'personality': 'Personality',
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
