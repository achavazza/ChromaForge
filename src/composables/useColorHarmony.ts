import chroma from 'chroma-js'

function getSafeHsl(hex: string) {
  const [h, s, l] = chroma(hex).hsl()
  return { hue: isNaN(h) ? 0 : h, sat: s || 0, lum: l || 0 }
}

export function getComplementary(hex: string): string {
  const { hue, sat, lum } = getSafeHsl(hex)
  return chroma.hsl((hue + 180) % 360, sat, lum).hex().toUpperCase()
}

export function getAnalogous(hex: string): string[] {
  const { hue, sat, lum } = getSafeHsl(hex)
  return [
    chroma.hsl((hue + 30 + 360) % 360, sat, lum).hex().toUpperCase(),
    chroma.hsl((hue - 30 + 360) % 360, sat, lum).hex().toUpperCase(),
  ]
}

export function getTriadic(hex: string): string[] {
  const { hue, sat, lum } = getSafeHsl(hex)
  return [
    chroma.hsl((hue + 120) % 360, sat, lum).hex().toUpperCase(),
    chroma.hsl((hue + 240) % 360, sat, lum).hex().toUpperCase(),
  ]
}
