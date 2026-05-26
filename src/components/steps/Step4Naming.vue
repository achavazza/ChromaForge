<template>
  <div class="step-root animate-fade-in">
    <div class="step-header">
      <div>
        <h1 class="step-title">Naming & Semantic Refinement</h1>
        <p class="step-subtitle">Finalize token names, assign missing roles, and organize your design system semantically.</p>
      </div>
      <div class="naming-actions">
        <button class="btn btn-secondary" @click="autoNameAll">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          Auto-name All
        </button>
        <button class="btn btn-secondary" @click="autoAssignRoles">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          Auto-assign Roles
        </button>
      </div>
    </div>

    <div class="naming-grid">
      <ColorCard
        v-for="color in palette.colors"
        :key="color.id"
        :color="color"
        :show-naming="true"
        :open-role-dropdown-id="openRoleDropdownId"
        :taken-roles="takenRoles"
        @update="(updates) => palette.updateColor(color.id, updates)"
        @update:open-role-dropdown-id="openRoleDropdownId = $event"
        @remove="palette.removeColor(color.id)"
        @duplicate="palette.duplicateColor(color.id)"
      />
    </div>

    <TonalSection :colors="palette.colors" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import type { SemanticRole } from '../../stores/palette'
import { generateName } from '../../composables/useColorUtils'
import ColorCard from '../ui/ColorCard.vue'
import TonalSection from '../ui/TonalSection.vue'

const palette = usePaletteStore()
const themeStore = useThemeStore()

const openRoleDropdownId = ref<string | null>(null)

const takenRoles = computed(() => {
  const s = new Set<SemanticRole>()
  palette.colors.forEach(c => c.roles.forEach(r => s.add(r)))
  return s
})

function autoNameAll() {
  palette.colors.forEach(c => {
    const name = generateName(c.hex, c.roles)
    palette.updateColor(c.id, { name })
  })
}

function hueDistToRange(hue: number, low: number, high: number): number {
  if (low <= high) {
    if (hue >= low && hue <= high) return 0
    const dLow = Math.min(Math.abs(hue - low), Math.abs(hue + 360 - low), Math.abs(hue - 360 - low))
    const dHigh = Math.min(Math.abs(hue - high), Math.abs(hue + 360 - high), Math.abs(hue - 360 - high))
    return Math.min(dLow, dHigh)
  }
  if (hue >= low || hue <= high) return 0
  return Math.min(Math.abs(hue - low), Math.abs(hue + 360 - high))
}

function autoAssignRoles() {
  const cs = palette.colors
  cs.forEach(c => { (c as any).roles = [] })

  const darkMode = themeStore.isDark
  const pool = [...cs]

  function pick(role: SemanticRole, score: (c: any) => number) {
    const sorted = [...pool].sort((a, b) => score(b) - score(a))
    const best = sorted[0]
    if (!best) return
    const current = [...best.roles]
    current.push(role)
    palette.updateColor(best.id, { roles: current })
    pool.splice(pool.indexOf(best), 1)
  }

  if (darkMode) {
    pick('background', c => -chroma(c.hex).get('oklch.l'))
    pick('text-primary', c => chroma(c.hex).get('oklch.l'))
  } else {
    pick('background', c => chroma(c.hex).get('oklch.l'))
    pick('text-primary', c => -chroma(c.hex).get('oklch.l'))
  }
   cs.forEach(c => { if (!pool.includes(c)) pool.push(c) })

   pick('primary', c => chroma(c.hex).get('hsl.s'))
   pick('error', c => -hueDistToRange((chroma(c.hex).get('oklch.h') + 360) % 360, 0, 25))
   pick('success', c => -hueDistToRange((chroma(c.hex).get('oklch.h') + 360) % 360, 130, 170))
   pick('warning', c => -hueDistToRange((chroma(c.hex).get('oklch.h') + 360) % 360, 70, 100))
   pick('info', c => -hueDistToRange((chroma(c.hex).get('oklch.h') + 360) % 360, 220, 260))
}
</script>

<style scoped>
.step-root { max-width: 960px; margin: 0 auto; }

.step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
}

.naming-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.step-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
}

.step-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.naming-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
</style>
