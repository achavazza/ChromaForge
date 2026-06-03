import chroma from 'chroma-js'
import type { ColorEntry, ContrastPair } from '../stores/palette'

export interface ContrastRepairVariant {
  variant: 'a' | 'b' | 'c'
  label: string
  fg: string
  bg: string
  ratio: number
  deltaE: number
}

export interface ContrastRepair {
  type: 'contrast'
  foregroundId: string
  backgroundId: string
  currentFg: string
  currentBg: string
  currentRatio: number
  repairs: ContrastRepairVariant[]
  chosenVariant?: 'a' | 'b' | 'c'
}

export interface CBConflictAlternative {
  variant: 'a' | 'b' | 'c'
  label: string
  hex: string
  deltaE: number
  simDeltaE: number
}

export interface CBConflictRepair {
  type: 'cb-conflict'
  typeName: string
  colorId: string
  partnerColorId: string
  currentHex: string
  partnerHex: string
  simDelta: number
  alternatives: CBConflictAlternative[]
  chosenVariant?: 'a' | 'b' | 'c'
}

export type AccessRepair = ContrastRepair | CBConflictRepair

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

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

function findMinContrastFix(fg: string, bg: string, targetRatio = 4.5): string | null {
  try {
    const fgLab = chroma(fg)
    const bgLum = chroma(bg).luminance()
    const darken = bgLum > 0.4
    const steps = 60
    const c = fgLab.get('oklch.c')
    const h = fgLab.get('oklch.h')
    for (let i = 1; i <= steps; i++) {
      const delta = i * 0.012
      const newL = darken
        ? Math.max(0.05, fgLab.get('oklch.l') - delta)
        : Math.min(0.95, fgLab.get('oklch.l') + delta)
      const hex = chroma.oklch(newL, c, h).hex()
      try {
        if (chroma.contrast(hex, bg) >= targetRatio) return hex
      } catch { continue }
    }
    return null
  } catch { return null }
}

function findCBAlternative(
  baseHex: string,
  partnerHex: string,
  cbType: 'p' | 'd' | 't',
  minHueShift = 15,
  maxHueShift = 60
): { hex: string; simDelta: number } | null {
  try {
    const base = chroma(baseHex)
    const partnerSim = chroma(simulateCVD(partnerHex, cbType))
    const partnerSimDelta = (a: string, b: string) => {
      try { return chroma.deltaE(a, b) } catch { return 0 }
    }
    const h = base.get('oklch.h')
    const c = base.get('oklch.c')
    const l = base.get('oklch.l')
    for (let shift = minHueShift; shift <= maxHueShift; shift += 5) {
      for (const dir of [1, -1]) {
        const newH = (h + shift * dir + 360) % 360
        const hex = chroma.oklch(l, c, newH).hex()
        const simDelta = partnerSimDelta(hex, partnerSim.hex())
        if (simDelta >= 20) return { hex, simDelta: Math.round(simDelta) }
      }
    }
    return null
  } catch { return null }
}

export function computeContrastRepairs(pairs: ContrastPair[], colors: ColorEntry[]): ContrastRepair[] {
  const repairs: ContrastRepair[] = []
  for (const p of pairs) {
    if (p.ignored || p.wcagAA || p.foregroundId === p.backgroundId) continue
    const fg = colors.find(c => c.id === p.foregroundId)
    const bg = colors.find(c => c.id === p.backgroundId)
    if (!fg || !bg) continue

    const currentRatio = p.ratio
    const fixA = findMinContrastFix(fg.hex, bg.hex, 4.5)
    if (!fixA) continue
    const deltaEA = Math.round(chroma.deltaE(fg.hex, fixA))

    const fixB = findMinContrastFix(fg.hex, bg.hex, 5.5)
    if (!fixB) continue
    const deltaEB = Math.round(chroma.deltaE(fg.hex, fixB))

    const bgLum = chroma(bg.hex).luminance()
    const darken = bgLum > 0.4
    const fixC = (() => {
      try {
        const base = chroma(fg.hex)
        const c = base.get('oklch.c') * 0.7
        const steps = 40
        for (let i = 1; i <= steps; i++) {
          const delta = i * 0.015
          const newL = darken
            ? Math.max(0.05, base.get('oklch.l') - delta)
            : Math.min(0.95, base.get('oklch.l') + delta)
          const hex = chroma.oklch(newL, c, base.get('oklch.h')).hex()
          if (chroma.contrast(hex, bg.hex) >= 4.5) return hex
        }
        return null
      } catch { return null }
    })()
    const deltaEC = fixC ? Math.round(chroma.deltaE(fg.hex, fixC)) : 0

    const repairsList: ContrastRepairVariant[] = [
      {
        variant: 'a',
        label: 'Minimum adjustment',
        fg: fixA,
        bg: bg.hex,
        ratio: Math.round(chroma.contrast(fixA, bg.hex) * 10) / 10,
        deltaE: deltaEA,
      },
      {
        variant: 'b',
        label: 'Stronger contrast',
        fg: fixB,
        bg: bg.hex,
        ratio: Math.round(chroma.contrast(fixB, bg.hex) * 10) / 10,
        deltaE: deltaEB,
      },
    ]
    if (fixC && fixC !== fixA && fixC !== fixB) {
      repairsList.push({
        variant: 'c',
        label: 'Desaturated variant',
        fg: fixC,
        bg: bg.hex,
        ratio: Math.round(chroma.contrast(fixC, bg.hex) * 10) / 10,
        deltaE: deltaEC,
      })
    }

    repairs.push({
      type: 'contrast',
      foregroundId: p.foregroundId,
      backgroundId: p.backgroundId,
      currentFg: fg.hex,
      currentBg: bg.hex,
      currentRatio: Math.round(currentRatio * 10) / 10,
      repairs: repairsList,
    })
  }
  return repairs
}

export function computeCBConflicts(colors: ColorEntry[]): CBConflictRepair[] {
  const repairs: CBConflictRepair[] = []
  const cbTypes = [
    { name: 'Protanopia', id: 'p' as const },
    { name: 'Deuteranopia', id: 'd' as const },
    { name: 'Tritanopia', id: 't' as const },
  ]
  for (const cb of cbTypes) {
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const a = colors[i]
        const b = colors[j]
        try {
          const simA = simulateCVD(a.hex, cb.id)
          const simB = simulateCVD(b.hex, cb.id)
          const simDelta = chroma.deltaE(simA, simB)
          if (simDelta < 15) {
            const altA = findCBAlternative(a.hex, b.hex, cb.id)
            const altB = findCBAlternative(b.hex, a.hex, cb.id)
            const alternatives: CBConflictAlternative[] = []
            if (altA) {
              alternatives.push({
                variant: 'a',
                label: `Shift ${a.name || a.hex}`,
                hex: altA.hex,
                deltaE: Math.round(chroma.deltaE(a.hex, altA.hex)),
                simDeltaE: altA.simDelta,
              })
            }
            const altA2 = findCBAlternative(a.hex, b.hex, cb.id, 30, 90)
            if (altA2 && (!altA || Math.abs(altA2.simDelta - altA.simDelta) > 5)) {
              alternatives.push({
                variant: 'b',
                label: `Shift ${a.name || a.hex} (wider)`,
                hex: altA2.hex,
                deltaE: Math.round(chroma.deltaE(a.hex, altA2.hex)),
                simDeltaE: altA2.simDelta,
              })
            }
            if (altB) {
              alternatives.push({
                variant: 'c',
                label: `Shift ${b.name || b.hex}`,
                hex: altB.hex,
                deltaE: Math.round(chroma.deltaE(b.hex, altB.hex)),
                simDeltaE: altB.simDelta,
              })
            }
            if (alternatives.length > 0) {
              repairs.push({
                type: 'cb-conflict',
                typeName: cb.name,
                colorId: a.id,
                partnerColorId: b.id,
                currentHex: a.hex,
                partnerHex: b.hex,
                simDelta: Math.round(simDelta),
                alternatives,
              })
            }
          }
        } catch { /* skip */ }
      }
    }
  }
  return repairs
}
