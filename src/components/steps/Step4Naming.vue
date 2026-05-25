<template>
  <div class="step-root animate-fade-in">
    <div class="step-header">
      <div>
        <h1 class="step-title">Naming & Semantic Refinement</h1>
        <p class="step-subtitle">Finalize token names, assign missing roles, and organize your design system semantically.</p>
      </div>
      <button class="btn btn-secondary" @click="autoNameAll">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        Auto-name All
      </button>
      <button class="btn btn-secondary" @click="autoAssignRoles">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        Auto-assign Roles
      </button>
    </div>

    <div class="naming-grid">
      <div
        v-for="color in palette.colors"
        :key="color.id"
        class="naming-card"
        :class="{ 'missing-role': color.roles.length === 0 }"
      >
        <!-- Color preview -->
        <div class="naming-preview" :style="{ background: color.hex }">
          <span class="naming-hex" :style="{ color: getBestText(color.hex) }">{{ color.hex }}</span>
        </div>

        <!-- Token name -->
        <div class="naming-body">
          <div class="token-row">
            <span class="token-prefix">--</span>
            <input
              class="token-input"
              :value="tokenName(color)"
              @input="(e) => palette.updateColor(color.id, { name: (e.target as HTMLInputElement).value })"
              placeholder="token-name"
              :id="`token-${color.id}`"
            />
            <button class="btn btn-ghost btn-icon-sm" @click="autoName(color)" title="Auto-generate name">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            </button>
          </div>

          <div class="naming-role-row">
            <div class="role-select-wrapper" :ref="(el) => setRoleSelectRef(color.id, el as HTMLElement)">
              <button class="role-select-trigger" @click="toggleRoleDropdown(color.id)" type="button">
                <span v-if="color.roles.length === 0" class="role-select-placeholder">No Role</span>
                <span v-else class="role-chips">
                  <span v-for="r in color.roles" :key="r" class="role-chip-inline">{{ getRoleLabel(r) }}</span>
                </span>
                <svg class="role-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              <div v-if="openRoleDropdownId === color.id" class="role-dropdown">
                <div v-for="g in roleGroups" :key="g.label" class="role-group-block">
                  <div class="role-group-label">{{ g.label }}</div>
                  <button
                    v-for="r in g.roles"
                    :key="r.value"
                    class="role-item"
                    :class="{
                      assigned: color.roles.includes(r.value),
                      disabled: takenRoles.has(r.value) && !color.roles.includes(r.value)
                    }"
                    :disabled="takenRoles.has(r.value) && !color.roles.includes(r.value)"
                    @click="toggleRole(color, r.value)"
                  >
                    <span class="role-item-icon">
                      <svg v-if="color.roles.includes(r.value)" class="icon-remove" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                      <svg v-else class="icon-add" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </span>
                    <span class="role-item-label">{{ r.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Missing role warning -->
          <div v-if="color.roles.length === 0" class="role-warning">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            No semantic role assigned
          </div>

          <!-- Token preview -->
          <div class="token-preview-row">
            <code class="token-preview">--{{ tokenName(color) }}: {{ color.hex.toLowerCase() }}</code>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { getBestTextColor, generateName } from '../../composables/useColorUtils'

const palette = usePaletteStore()
const themeStore = useThemeStore()

const openRoleDropdownId = ref<string | null>(null)
const roleSelectRefs = new Map<string, HTMLElement>()

function setRoleSelectRef(id: string, el: HTMLElement) {
  roleSelectRefs.set(id, el)
}

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

function toggleRoleDropdown(id: string) {
  openRoleDropdownId.value = openRoleDropdownId.value === id ? null : id
}

function onClickOutside(e: MouseEvent) {
  if (!openRoleDropdownId.value) return
  const el = roleSelectRefs.get(openRoleDropdownId.value)
  if (el && !el.contains(e.target as Node)) {
    openRoleDropdownId.value = null
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function getBestText(hex: string) { return getBestTextColor(hex) }

const takenRoles = computed(() => {
  const s = new Set<SemanticRole>()
  palette.colors.forEach(c => c.roles.forEach(r => s.add(r)))
  return s
})

function toggleRole(color: ColorEntry, role: SemanticRole) {
  const current = [...color.roles]
  const idx = current.indexOf(role)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    palette.colors.forEach(c => {
      if (c.id !== color.id && c.roles.includes(role)) {
        (c as ColorEntry).roles = c.roles.filter(r => r !== role)
      }
    })
    current.push(role)
  }
  palette.updateColor(color.id, { roles: current })
}

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

function tokenName(color: ColorEntry): string {
  if (color.name) return color.name.toLowerCase().replace(/\s+/g, '-')
  return generateName(color.hex, color.roles)
}

function autoName(color: ColorEntry) {
  const name = generateName(color.hex, color.roles)
  palette.updateColor(color.id, { name })
}

function autoNameAll() {
  palette.colors.forEach(c => autoName(c))
}

function autoAssignRoles() {
  const cs = palette.colors
  if (!cs.length) return

  // Clear all roles first
  cs.forEach(c => palette.updateColor(c.id, { roles: [] }))

  const darkMode = themeStore.isDark
  const pool = [...cs]
  const assigned = new Set<string>()

  function pick(role: SemanticRole, score: (c: ColorEntry) => number) {
    const sorted = [...pool].sort((a, b) => score(b) - score(a))
    const best = sorted[0]
    if (!best) return
    const current = [...best.roles]
    current.push(role)
    palette.updateColor(best.id, { roles: current })
    assigned.add(role)
    pool.splice(pool.indexOf(best), 1)
  }

  // Layout
  if (darkMode) {
    pick('background', c => -chroma(c.hex).luminance())
    pick('surface', c => -chroma(c.hex).luminance())
    pick('text-primary', c => chroma(c.hex).luminance())
  } else {
    pick('background', c => chroma(c.hex).luminance())
    pick('surface', c => chroma(c.hex).luminance())
    pick('text-primary', c => -chroma(c.hex).luminance())
  }

  // Restore pool (allow same colors to get more roles)
  cs.forEach(c => { if (!pool.includes(c)) pool.push(c) })

  pick('primary', c => chroma(c.hex).get('hsl.s'))
  pick('error', c => -Math.abs(((chroma(c.hex).get('hsl.h') + 360) % 360) - 0))
  pick('success', c => -Math.abs(((chroma(c.hex).get('hsl.h') + 360) % 360) - 120))
  pick('warning', c => -Math.abs(((chroma(c.hex).get('hsl.h') + 360) % 360) - 60))
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

.step-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: 6px;
}

.step-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.6;
}

.naming-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}

.naming-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  transition: box-shadow 0.2s, border-color 0.2s;
}

.naming-card:hover {
  box-shadow: var(--shadow-md);
}

.naming-card.missing-role {
  border-color: rgba(245, 158, 11, 0.3);
}

.naming-preview {
  height: 72px;
  display: flex;
  align-items: flex-end;
  padding: 8px 12px;
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
}

.naming-hex {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  opacity: 0.8;
}

.naming-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.token-row {
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  overflow: hidden;
}

.token-prefix {
  padding: 0 6px 0 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--accent);
  font-weight: 700;
  flex-shrink: 0;
}

.token-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
  padding: 7px 8px 7px 0;
  min-width: 0;
}

.token-input::placeholder { color: var(--text-tertiary); }

.naming-role-row {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.role-select-wrapper {
  position: relative;
  flex: 1;
}

.role-select-trigger {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 6px 8px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-primary);
  text-align: left;
  transition: border-color 0.15s;
}

.role-select-trigger:hover {
  border-color: var(--accent);
}

.role-select-placeholder {
  color: var(--text-tertiary);
  flex: 1;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  flex: 1;
}

.role-chip-inline {
  font-size: 10px;
  background: var(--accent-soft, rgba(99,102,241,0.12));
  color: var(--accent);
  padding: 1px 5px;
  border-radius: 3px;
  font-weight: 500;
}

.role-chevron {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.role-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 50;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 6px 0;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  max-height: 280px;
  overflow-y: auto;
}

.role-group-block {
  padding: 0;
}

.role-group-label {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-tertiary);
  padding: 6px 10px 3px;
  font-weight: 700;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 5px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: left;
  transition: background 0.12s, color 0.12s;
}

.role-item:not(.disabled):hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.role-item.assigned:not(.disabled):hover {
  background: var(--error-soft, rgba(239,68,68,0.08));
  color: var(--error);
}

.role-item:not(.assigned):not(.disabled):hover {
  background: var(--success-soft, rgba(34,197,94,0.08));
  color: var(--success);
}

.role-item.disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.role-item-icon {
  flex-shrink: 0;
  width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.role-item:not(:hover) .role-item-icon {
  opacity: 0;
}

.role-item:hover .role-item-icon {
  opacity: 1;
}

.role-item:not(.assigned):not(.disabled):hover .icon-add {
  color: var(--success);
}

.role-item.assigned:not(.disabled):hover .icon-remove {
  color: var(--error);
}

.role-item.assigned .role-item-label {
  color: var(--accent);
  font-weight: 500;
}

.role-item-label {
  flex: 1;
}

.role-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--warning);
  background: var(--warning-soft);
  padding: 4px 8px;
  border-radius: 4px;
}

.token-preview-row {
  border-top: 1px solid var(--border-subtle);
  padding-top: 8px;
}

.token-preview {
  font-size: 10px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary);
  word-break: break-all;
}


</style>
