<template>
  <div
    class="naming-card"
    :class="{ 'missing-role': color.roles.length === 0 }"
  >
    <div class="naming-preview" :style="{ background: color.hex }">
      <span class="naming-hex" :style="{ color: getBestText(color.hex) }">{{ color.hex }}</span>
    </div>

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

      <div v-if="color.roles.length === 0" class="role-warning">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        No semantic role assigned
      </div>

      <div class="token-preview-row">
        <code class="token-preview">--{{ tokenName(color) }}: {{ color.hex.toLowerCase() }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePaletteStore } from '../../stores/palette'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { getBestTextColor, generateName } from '../../composables/useColorUtils'

const props = defineProps<{
  color: ColorEntry
  openRoleDropdownId: string | null
  takenRoles: Set<SemanticRole>
}>()

const emit = defineEmits<{
  'update:openRoleDropdownId': [id: string | null]
  toggleRole: [color: ColorEntry, role: SemanticRole]
}>()

const palette = usePaletteStore()
const roleSelectRefs = new Map<string, HTMLElement>()

function setRoleSelectRef(id: string, el: HTMLElement) {
  roleSelectRefs.set(id, el)
}

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [
    { value: 'background', label: 'Background' },
    { value: 'text-primary', label: 'Text Primary' },
    { value: 'surface', label: 'Surface' },
  ]},
  { label: 'Semantic', roles: [
    { value: 'primary', label: 'Primary' },
    { value: 'error', label: 'Error' },
    { value: 'success', label: 'Success' },
    { value: 'warning', label: 'Warning' },
  ]},
]

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

function toggleRoleDropdown(id: string) {
  emit('update:openRoleDropdownId', props.openRoleDropdownId === id ? null : id)
}

function onClickOutside(e: MouseEvent) {
  if (!props.openRoleDropdownId) return
  const el = roleSelectRefs.get(props.openRoleDropdownId)
  if (el && !el.contains(e.target as Node)) {
    emit('update:openRoleDropdownId', null)
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function getBestText(hex: string) { return getBestTextColor(hex) }

function tokenName(color: ColorEntry) {
  return color.name || generateName(color.hex, color.roles)
}

function autoName(color: ColorEntry) {
  const name = generateName(color.hex, color.roles)
  palette.updateColor(color.id, { name })
}

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
</script>

<style scoped>
.naming-card {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  overflow: visible;
}

.naming-card.missing-role {
  border-color: var(--warning);
}

.naming-preview {
  height: 40px;
  border-radius: var(--radius) var(--radius) 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.naming-hex {
  font-size: 11px;
  font-weight: 600;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
}

.naming-body {
  padding: 12px;
}

.token-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 10px;
}

.token-prefix {
  font-size: 11px;
  color: var(--text-tertiary);
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  flex-shrink: 0;
}

.token-input {
  flex: 1;
  background: none;
  border: none;
  font-size: 13px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--text-primary);
  outline: none;
  padding: 2px 0;
}

.role-select-wrapper {
  position: relative;
}

.role-select-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-default);
  border-radius: 5px;
  font-size: 11px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color 0.12s;
  min-width: 70px;
}

.role-select-trigger:hover {
  border-color: var(--accent);
}

.role-select-placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.role-chips {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
}

.role-chip-inline {
  background: var(--accent-soft, rgba(99,102,241,0.12));
  color: var(--accent);
  font-size: 10px;
  font-weight: 500;
  padding: 1px 5px;
  border-radius: 3px;
}

.role-chevron {
  transition: transform 0.15s;
  color: var(--text-tertiary);
}

.role-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 4px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 6px;
  min-width: 180px;
  z-index: 20;
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.role-group-block {
  margin-bottom: 4px;
}

.role-group-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  padding: 4px 8px 2px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  background: none;
  border: none;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.1s;
}

.role-item:hover {
  background: var(--bg-secondary);
}

.role-item.disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.role-item-icon {
  display: flex;
  align-items: center;
  width: 14px;
  justify-content: center;
  flex-shrink: 0;
}

.icon-remove { color: var(--error); }
.icon-add { color: var(--success); }

.role-item-label {
  font-size: 11px;
}

.role-warning {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 10px;
  color: var(--warning);
}

.token-preview-row {
  margin-top: 8px;
}

.token-preview {
  font-size: 10px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--text-tertiary);
  word-break: break-all;
}
</style>
