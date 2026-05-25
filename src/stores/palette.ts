import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chroma from 'chroma-js'

export type SemanticRole =
  | 'background' | 'surface' | 'primary' | 'secondary' | 'tertiary'
  | 'accent' | 'accent-hover' | 'success' | 'warning' | 'error' | 'info'
  | 'border' | 'muted' | 'text-primary' | 'text-secondary'
  | 'neutral' | 'neutral-dark' | 'neutral-light'

export interface ColorEntry {
  id: string
  hex: string
  name: string
  roles: SemanticRole[]
  locked: boolean
}

export interface ContrastPair {
  id: string
  foregroundId: string
  backgroundId: string
  ratio: number
  wcagAA: boolean
  wcagAAA: boolean
  wcagAALarge: boolean
  wcagAAALarge: boolean
  approved: boolean
  ignored: boolean
  label: string
}

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

function getContrastRatio(hex1: string, hex2: string): number {
  try {
    return chroma.contrast(hex1, hex2)
  } catch {
    return 1
  }
}

const DEFAULT_PALETTE: ColorEntry[] = []

export const usePaletteStore = defineStore('palette', () => {
  const colors = ref<ColorEntry[]>(DEFAULT_PALETTE.map(c => ({ ...c, id: uid() })))
  const originalColors = ref<ColorEntry[]>(JSON.parse(JSON.stringify(colors.value)))
  const contrastPairs = ref<ContrastPair[]>([])
  const approvedPairings = ref<Set<string>>(new Set())
  const ignoredPairings = ref<Set<string>>(new Set())

  function addColor(hex = '#6366f1') {
    colors.value.push({ id: uid(), hex, name: '', roles: [], locked: false })
  }

  function removeColor(id: string) {
    colors.value = colors.value.filter(c => c.id !== id)
  }

  function duplicateColor(id: string) {
    const idx = colors.value.findIndex(c => c.id === id)
    if (idx === -1) return
    const copy = { ...colors.value[idx], id: uid(), name: colors.value[idx].name + ' Copy' }
    colors.value.splice(idx + 1, 0, copy)
  }

  function updateColor(id: string, updates: Partial<ColorEntry>) {
    const c = colors.value.find(c => c.id === id)
    if (c) Object.assign(c, updates)
  }

  function reorderColors(newOrder: ColorEntry[]) {
    colors.value = newOrder
  }

  function importColors(hexList: string[]) {
    hexList.forEach(hex => {
      colors.value.push({ id: uid(), hex, name: '', roles: [], locked: false })
    })
  }

  function generateContrastPairs() {
    const pairs: ContrastPair[] = []
    const cs = colors.value
    for (let i = 0; i < cs.length; i++) {
      for (let j = i + 1; j < cs.length; j++) {
        const ratio = getContrastRatio(cs[i].hex, cs[j].hex)
        const pairId = `${cs[i].id}-${cs[j].id}`
        pairs.push({
          id: pairId,
          foregroundId: cs[i].id,
          backgroundId: cs[j].id,
          ratio: Math.round(ratio * 100) / 100,
          wcagAA: ratio >= 4.5,
          wcagAAA: ratio >= 7,
          wcagAALarge: ratio >= 3,
          wcagAAALarge: ratio >= 4.5,
          approved: approvedPairings.value.has(pairId),
          ignored: ignoredPairings.value.has(pairId),
          label: `${cs[i].name || cs[i].hex} / ${cs[j].name || cs[j].hex}`,
        })
      }
    }
    contrastPairs.value = pairs.sort((a, b) => b.ratio - a.ratio)
  }

  function toggleApproved(pairId: string) {
    const pair = contrastPairs.value.find(p => p.id === pairId)
    if (!pair) return
    pair.approved = !pair.approved
    if (pair.approved) approvedPairings.value.add(pairId)
    else approvedPairings.value.delete(pairId)
  }

  function toggleIgnored(pairId: string) {
    const pair = contrastPairs.value.find(p => p.id === pairId)
    if (!pair) return
    pair.ignored = !pair.ignored
    if (pair.ignored) ignoredPairings.value.add(pairId)
    else ignoredPairings.value.delete(pairId)
  }

  function snapshotOriginal() {
    originalColors.value = JSON.parse(JSON.stringify(colors.value))
  }

  const colorById = computed(() => {
    const map = new Map<string, ColorEntry>()
    colors.value.forEach(c => map.set(c.id, c))
    return map
  })

  const aaaCount = computed(() => contrastPairs.value.filter(p => p.wcagAAA && !p.ignored).length)
  const aaCount = computed(() => contrastPairs.value.filter(p => p.wcagAA && !p.wcagAAA && !p.ignored).length)
  const failCount = computed(() => contrastPairs.value.filter(p => !p.wcagAA && !p.ignored).length)

  return {
    colors, originalColors, contrastPairs,
    addColor, removeColor, duplicateColor, updateColor, reorderColors, importColors,
    generateContrastPairs, toggleApproved, toggleIgnored, snapshotOriginal,
    colorById, aaaCount, aaCount, failCount,
  }
})
