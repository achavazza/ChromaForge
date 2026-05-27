import chroma from 'chroma-js'
import type { ColorEntry } from '../stores/palette'

export function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim())
}

export function parseHexInput(raw: string): string[] {
  const trimmed = raw.trim()
  // Detect JSON array format: ["#hex","#hex",...]
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed)
      if (Array.isArray(parsed)) {
        return parsed
          .map(t => String(t).trim())
          .filter(t => t.length > 0)
          .map(t => t.startsWith('#') ? t : '#' + t)
          .filter(t => isValidHex(t))
          .map(t => t.toUpperCase())
      }
    } catch { /* fall through to token-based parsing */ }
  }
  const tokens = raw.split(/[\s,;\n\r]+/)
  return tokens
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => t.startsWith('#') ? t : '#' + t)
    .filter(t => isValidHex(t))
    .map(t => t.toUpperCase())
}

export function getContrastRatio(hex1: string, hex2: string): number {
  try {
    return Math.round(chroma.contrast(hex1, hex2) * 100) / 100
  } catch {
    return 1
  }
}

export function getLuminance(hex: string): number {
  try {
    return chroma(hex).luminance()
  } catch {
    return 0
  }
}

export function getHSL(hex: string): [number, number, number] {
  try {
    const [h, s, l] = chroma(hex).hsl()
    return [h || 0, s || 0, l || 0]
  } catch {
    return [0, 0, 0]
  }
}

export function getLightness(hex: string): number {
  try {
    return chroma(hex).get('lab.l')
  } catch {
    return 0
  }
}

export function getSaturation(hex: string): number {
  try {
    return chroma(hex).get('hsl.s')
  } catch {
    return 0
  }
}

export function getHue(hex: string): number {
  try {
    const h = chroma(hex).get('hsl.h')
    return isNaN(h) ? 0 : h
  } catch {
    return 0
  }
}

export function lighten(hex: string, amount: number): string {
  try {
    return chroma(hex).brighten(amount).hex().toUpperCase()
  } catch {
    return hex
  }
}

export function darken(hex: string, amount: number): string {
  try {
    return chroma(hex).darken(amount).hex().toUpperCase()
  } catch {
    return hex
  }
}

export function desaturate(hex: string, amount: number): string {
  try {
    return chroma(hex).desaturate(amount).hex().toUpperCase()
  } catch {
    return hex
  }
}

export function mix(hex1: string, hex2: string, ratio = 0.5): string {
  try {
    return chroma.mix(hex1, hex2, ratio, 'lab').hex().toUpperCase()
  } catch {
    return hex1
  }
}

export function getColorTemperature(hex: string): 'warm' | 'cool' | 'neutral' {
  const hue = getHue(hex)
  if (hue >= 0 && hue < 60) return 'warm'
  if (hue >= 60 && hue < 150) return 'neutral'
  if (hue >= 150 && hue < 270) return 'cool'
  if (hue >= 270 && hue < 330) return 'cool'
  return 'warm'
}

export function isLight(hex: string): boolean {
  return getLuminance(hex) > 0.5
}

export function getBestTextColor(hex: string): string {
  return isLight(hex) ? '#0f0f14' : '#f0f0f8'
}

export function generateTonalScale(hex: string): string[] {
  try {
    const base = chroma(hex)
    return [
      base.luminance(0.95).hex().toUpperCase(),
      base.luminance(0.8).hex().toUpperCase(),
      base.luminance(0.6).hex().toUpperCase(),
      base.luminance(0.4).hex().toUpperCase(),
      hex.toUpperCase(),
      base.luminance(0.15).hex().toUpperCase(),
      base.luminance(0.07).hex().toUpperCase(),
      base.luminance(0.03).hex().toUpperCase(),
    ]
  } catch {
    return [hex]
  }
}

export interface TonalScaleResult {
  scale: string[]
  activeIndex: number
}

export function generateTonalScaleOKLCH(hex: string, steps = 9): TonalScaleResult {
  try {
    const color = chroma(hex)
    const [l, c, h] = color.oklch()
    const darkEnd = 0.02
    const lightEnd = 0.95
    const targets: number[] = []
    let activeIndex = 0
    let minDist = Infinity
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1)
      const lum = darkEnd * (1 - t) + lightEnd * t
      targets.push(Math.max(0, Math.min(1, lum)))
      const dist = Math.abs(lum - l)
      if (dist < minDist) {
        minDist = dist
        activeIndex = i
      }
    }
    const scale = targets.map(lum => {
      let cc = c
      for (let attempt = 0; attempt < 10; attempt++) {
        try {
          const cl = chroma.oklch(Math.max(0, Math.min(1, lum)), cc, h)
          return cl.hex().toUpperCase()
        } catch {
          cc *= 0.85
        }
      }
      try {
        return chroma.hsl((h + 360) % 360, 0, lum).hex().toUpperCase()
      } catch {
        return hex.toUpperCase()
      }
    })
    return { scale, activeIndex }
  } catch {
    const fallback = generateTonalScale(hex)
    return { scale: fallback, activeIndex: Math.floor(fallback.length / 2) }
  }
}

export function generateName(hex: string, roles: string[]): string {
  if (roles.length > 0) {
    const l = chroma(hex).get('oklch.l')
    const role = roles[0]
    if (l > 0.92) return `${role}-50`
    if (l > 0.82) return `${role}-100`
    if (l > 0.70) return `${role}-200`
    if (l > 0.58) return `${role}-300`
    if (l > 0.46) return `${role}-400`
    if (l > 0.35) return `${role}-500`
    if (l > 0.25) return `${role}-600`
    if (l > 0.15) return `${role}-700`
    if (l > 0.08) return `${role}-800`
    return `${role}-900`
  }
  try {
    const h = chroma(hex).get('oklch.h')
    const hueDeg = (isNaN(h) ? 0 : h + 360) % 360
    if (hueDeg < 15 || hueDeg >= 345) return 'red'
    if (hueDeg < 35) return 'orange'
    if (hueDeg < 65) return 'yellow'
    if (hueDeg < 150) return 'green'
    if (hueDeg < 200) return 'teal'
    if (hueDeg < 260) return 'blue'
    if (hueDeg < 330) return 'purple'
    return 'pink'
  } catch {
    return hex.toLowerCase()
  }
}

export function getAverageHue(colors: ColorEntry[]): number {
  const hues = colors.map(c => getHue(c.hex)).filter(h => h > 0)
  if (!hues.length) return 0
  return hues.reduce((a, b) => a + b, 0) / hues.length
}

export function formatHex(raw: string): string {
  let h = raw.trim().replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  return '#' + h.toUpperCase().slice(0, 6)
}

// ---- Palette DNA ----

export interface PaletteDNA {
  dominantHue: number
  averageChroma: number
  averageLightness: number
  saturationVariance: number
  warmCoolTendency: 'warm' | 'cool' | 'neutral'
  vibrancy: number
  overallMood: string
}

export function computePaletteDNA(colors: ColorEntry[]): PaletteDNA {
  if (!colors.length) {
    return { dominantHue: 0, averageChroma: 0, averageLightness: 0.5, saturationVariance: 0, warmCoolTendency: 'neutral', vibrancy: 0, overallMood: 'empty' }
  }

  const oklchValues = colors.map(c => {
    try { return chroma(c.hex).oklch() }
    catch { return [0.5, 0, 0] as [number, number, number] }
  })

  const lightnesses = oklchValues.map(v => v[0])
  const chromas = oklchValues.map(v => v[1])
  const hues = oklchValues.map(v => v[2]).filter(h => !isNaN(h))

  const averageLightness = lightnesses.reduce((a, b) => a + b, 0) / lightnesses.length
  const averageChroma = chromas.reduce((a, b) => a + b, 0) / chromas.length

  let sinSum = 0, cosSum = 0
  for (const h of hues) {
    sinSum += Math.sin(h * Math.PI / 180)
    cosSum += Math.cos(h * Math.PI / 180)
  }
  const dominantHue = ((Math.atan2(sinSum / hues.length, cosSum / hues.length) * 180 / Math.PI) + 360) % 360

  const sats = colors.map(c => { try { return chroma(c.hex).get('hsl.s') } catch { return 0 } })
  const meanSat = sats.reduce((a, b) => a + b, 0) / sats.length
  const saturationVariance = sats.reduce((sum, s) => sum + (s - meanSat) ** 2, 0) / sats.length

  const warmCoolTendency = (dominantHue >= 330 || dominantHue <= 60) ? 'warm'
    : (dominantHue >= 150 && dominantHue <= 300) ? 'cool' : 'neutral'

  const vibrancy = Math.min(1, averageChroma / 0.4)

  let overallMood: string
  if (vibrancy > 0.7 && averageLightness > 0.5) overallMood = 'bright and vibrant'
  else if (vibrancy > 0.7 && averageLightness <= 0.5) overallMood = 'deep and rich'
  else if (vibrancy < 0.3 && averageLightness > 0.7) overallMood = 'light and airy'
  else if (vibrancy < 0.3 && averageLightness < 0.3) overallMood = 'dark and muted'
  else if (vibrancy < 0.5) overallMood = 'subtle and refined'
  else if (warmCoolTendency === 'warm') overallMood = 'warm and energetic'
  else if (warmCoolTendency === 'cool') overallMood = 'cool and calm'
  else overallMood = 'balanced and versatile'

  return { dominantHue, averageChroma, averageLightness, saturationVariance, warmCoolTendency, vibrancy, overallMood }
}

// ---- Semantic color derivation ----

function circularHueDistance(a: number, b: number): number {
  const d = Math.abs(a - b)
  return Math.min(d, 360 - d)
}

function shortestDirection(from: number, to: number): number {
  const diff = ((to - from + 540) % 360) - 180
  return diff > 0 ? 1 : -1
}

function clampHueToRange(hue: number, low: number, high: number): number {
  if (low <= high) {
    if (hue >= low && hue <= high) return hue
    return circularHueDistance(hue, low) < circularHueDistance(hue, high) ? low : high
  }
  if (hue >= low || hue <= high) return hue
  return circularHueDistance(hue, low) < circularHueDistance(hue, high) ? low : high
}

function buildOKLCH(l: number, c: number, h: number): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    try { return chroma.oklch(l, c, h).hex().toUpperCase() }
    catch { c *= 0.85 }
  }
  const gray = Math.round(Math.max(0, Math.min(1, l)) * 255)
  return `#${gray.toString(16).padStart(2, '0').repeat(3)}`.toUpperCase()
}

export function deriveSemanticColor(
  dna: PaletteDNA,
  targetHueLow: number,
  targetHueHigh: number,
  mode: 'dark' | 'light',
  purpose: 'foreground' | 'background' | 'accent'
): string {
  const targetCenter = (targetHueLow + targetHueHigh) / 2
  const targetSpan = (targetHueHigh - targetHueLow) / 2
  let hue = dna.dominantHue
  const dist = circularHueDistance(hue, targetCenter)

  if (dist > targetSpan * 0.4) {
    const dir = shortestDirection(hue, targetCenter)
    hue = (hue + dir * (dist - targetSpan * 0.3)) % 360
    if (hue < 0) hue += 360
  }
  hue = clampHueToRange(hue, targetHueLow, targetHueHigh)

  let chroma: number
  if (purpose === 'accent') chroma = Math.min(0.35, dna.averageChroma * 1.2)
  else if (purpose === 'foreground') chroma = Math.min(0.28, dna.averageChroma * 0.9)
  else chroma = Math.min(0.08, dna.averageChroma * 0.35)
  chroma = Math.max(0.02, chroma)

  let lightness: number
  if (purpose === 'background') lightness = mode === 'dark' ? 0.08 : 0.94
  else if (purpose === 'foreground') lightness = mode === 'dark' ? 0.88 : 0.12
  else if (mode === 'dark') lightness = Math.min(0.75, Math.max(0.45, dna.averageLightness + 0.15))
  else lightness = Math.max(0.25, Math.min(0.55, dna.averageLightness - 0.1))

  return buildOKLCH(lightness, chroma, hue)
}

export function generatePaletteNeutral(dna: PaletteDNA, lightness: number, chromaStrength = 0.15): string {
  const chroma = Math.max(0.01, dna.averageChroma * chromaStrength)
  const hue = dna.dominantHue
  return buildOKLCH(Math.max(0.02, Math.min(0.98, lightness)), chroma, hue)
}
