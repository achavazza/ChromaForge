import chroma from 'chroma-js'
import type { ColorEntry } from '../stores/palette'

export function isValidHex(hex: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(hex.trim())
}

export function parseHexInput(raw: string): string[] {
  const tokens = raw.split(/[\s,;\n\r]+/)
  return tokens
    .map(t => t.trim())
    .filter(t => t.length > 0)
    .map(t => (t.startsWith('#') ? t : '#' + t))
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
    const [, , l] = getHSL(hex)
    const role = roles[0]
    if (l > 0.85) return `${role}-50`
    if (l > 0.7) return `${role}-100`
    if (l > 0.55) return `${role}-200`
    if (l > 0.4) return `${role}-300`
    if (l > 0.3) return `${role}-400`
    if (l > 0.2) return `${role}-500`
    if (l > 0.12) return `${role}-600`
    if (l > 0.07) return `${role}-700`
    if (l > 0.03) return `${role}-800`
    return `${role}-900`
  }
  return hex.toLowerCase()
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
