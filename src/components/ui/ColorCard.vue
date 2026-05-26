<template>
  <div class="color-card" :class="{ 'missing-role': showNaming && color.roles.length === 0 }" ref="cardRef">
    <div class="card-top-bar">
      <div class="drag-handle" title="Drag to reorder">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
        </svg>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost btn-icon-sm" @click="emit('duplicate')" title="Duplicate">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="btn btn-ghost btn-icon-sm remove-btn" @click="emit('remove')" title="Remove">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="color-preview" :style="{ background: color.hex }" @click="togglePopup">
      <span class="preview-hex-label" :style="{ color: bestTextColor }">{{ color.hex }}</span>
      <div class="preview-overlay">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2m0 16v2m9-9h-2M5 12H3"/>
        </svg>
      </div>
    </div>

    <ColorModal
      v-if="showPopup"
      :visible="showPopup"
      :color="color"
      mode="edit"
      :show-roles="false"
      @close="showPopup = false"
      @update:hex="(hex) => emit('update', { hex })"
      @clone="emit('duplicate')"
      @remove="emit('remove')"
    />

    <div class="card-body">
      <div v-if="showNaming" class="token-row">
        <span class="token-prefix">--</span>
        <input
          class="token-input"
          :value="tokenName"
          @input="(e) => palette.updateColor(color.id, { name: (e.target as HTMLInputElement).value })"
          placeholder="token-name"
          :id="`token-${color.id}`"
        />
        <button class="btn btn-ghost btn-icon-sm" @click="autoName" title="Auto-generate name">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
        </button>
      </div>

      <div class="card-hex-display">{{ color.hex }}</div>

      <div class="role-select-wrapper" :id="`role-select-${color.id}`" ref="roleSelectRef">
        <button class="role-select-trigger" @click="toggleRoleDropdown" type="button">
          <span v-if="color.roles.length === 0" class="role-select-placeholder">No Role</span>
          <span v-else class="role-chips">
            <span v-for="r in color.roles" :key="r" class="role-chip-inline">{{ getRoleLabel(r) }}</span>
          </span>
          <svg class="role-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="isRoleDropdownOpen" class="role-dropdown">
          <div v-for="g in roleGroups" :key="g.label" class="role-group-block">
            <div class="role-group-label">{{ g.label }}</div>
            <button
              v-for="r in g.roles"
              :key="r.value"
              class="role-item"
              :class="{
                assigned: color.roles.includes(r.value),
                disabled: effectiveTakenRoles.has(r.value) && !color.roles.includes(r.value)
              }"
              :disabled="effectiveTakenRoles.has(r.value) && !color.roles.includes(r.value)"
              @click="toggleRole(r.value)"
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

      <div v-if="showNaming && color.roles.length === 0" class="role-warning">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        No semantic role assigned
      </div>

      <div v-if="showNaming" class="token-preview-row">
        <code class="token-preview">--{{ tokenName }}: {{ color.hex.toLowerCase() }}</code>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { usePaletteStore } from '../../stores/palette'
import { getBestTextColor, generateName } from '../../composables/useColorUtils'
import ColorModal from './ColorModal.vue'

const palette = usePaletteStore()

interface Props {
  color: ColorEntry
  index?: number
  showNaming?: boolean
  openRoleDropdownId?: string | null
  takenRoles?: Set<SemanticRole>
}

const props = withDefaults(defineProps<Props>(), {
  index: 0,
  showNaming: false,
  openRoleDropdownId: undefined,
})

const emit = defineEmits<{
  update: [updates: Partial<ColorEntry>]
  remove: []
  duplicate: []
  'update:openRoleDropdownId': [id: string | null]
}>()

const showPopup = ref(false)
const localRoleDropdownOpen = ref(false)
const roleSelectRef = ref<HTMLElement>()

const isRoleDropdownOpen = computed(() => {
  if (props.openRoleDropdownId !== undefined) return props.openRoleDropdownId === props.color.id
  return localRoleDropdownOpen.value
})

const effectiveTakenRoles = computed(() => {
  if (props.takenRoles) return props.takenRoles
  const s = new Set<SemanticRole>()
  palette.colors.forEach(c => {
    if (c.id !== props.color.id) c.roles.forEach(r => s.add(r))
  })
  return s
})

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

const bestTextColor = computed(() => getBestTextColor(props.color.hex))
const tokenName = computed(() => props.color.name || generateName(props.color.hex, props.color.roles))

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

function toggleRole(role: SemanticRole) {
  const current = [...props.color.roles]
  const idx = current.indexOf(role)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    palette.colors.forEach(c => {
      if (c.id !== props.color.id && c.roles.includes(role)) {
        (c as ColorEntry).roles = c.roles.filter(r => r !== role)
      }
    })
    current.push(role)
  }
  palette.updateColor(props.color.id, { roles: current })
}

function toggleRoleDropdown() {
  if (props.openRoleDropdownId !== undefined) {
    emit('update:openRoleDropdownId', props.openRoleDropdownId === props.color.id ? null : props.color.id)
  } else {
    localRoleDropdownOpen.value = !localRoleDropdownOpen.value
  }
}

function autoName() {
  const name = generateName(props.color.hex, props.color.roles)
  palette.updateColor(props.color.id, { name })
}

function onClickOutside(e: MouseEvent) {
  if (props.openRoleDropdownId !== undefined) {
    if (roleSelectRef.value && !roleSelectRef.value.contains(e.target as Node)) {
      emit('update:openRoleDropdownId', null)
    }
  } else {
    if (roleSelectRef.value && !roleSelectRef.value.contains(e.target as Node)) {
      localRoleDropdownOpen.value = false
    }
  }
}

onMounted(() => {
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function togglePopup() {
  showPopup.value = !showPopup.value
}
</script>

<style scoped>
.color-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.15s ease;
  box-shadow: var(--shadow-sm);
  width: 100%;
}

.color-card.missing-role {
  border-color: var(--warning);
}

.color-preview {
  width: 100%;
  height: 100px;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.preview-hex-label {
  position: relative;
  z-index: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: -0.02em;
  opacity: 0;
  transition: opacity 0.15s;
  text-shadow: 0 1px 4px rgba(0,0,0,0.2);
}

.color-preview:hover .preview-hex-label {
  opacity: 1;
}

.color-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--border-strong);
}

.color-card:hover .card-top-bar {
  opacity: 1;
}

.card-top-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 6px;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(6px);
  border-radius: var(--radius) var(--radius) 0 0;
  opacity: 0;
  transition: opacity 0.15s ease;
  z-index: 2;
}

.card-top-bar .drag-handle,
.card-top-bar .card-actions button {
  color: rgba(255,255,255,0.9);
}

.card-top-bar .card-actions button:hover {
  color: white;
  background: rgba(255,255,255,0.15);
}

.drag-handle {
  cursor: grab;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.drag-handle:active {
  cursor: grabbing;
}

.card-actions {
  display: flex;
  gap: 2px;
}

.preview-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(2px);
  color: white;
}

.color-preview:hover .preview-overlay {
  opacity: 1;
}

.remove-btn:hover {
  color: var(--error) !important;
  background: var(--error-soft) !important;
}

.card-body {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-hex-display {
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.token-row {
  display: flex;
  align-items: center;
  gap: 6px;
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
  min-width: 0;
}

.role-select-wrapper {
  position: relative;
  width: 100%;
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
  margin-top: 2px;
  font-size: 10px;
  color: var(--warning);
  padding: 0 4px;
}

.token-preview-row {
  margin-top: 2px;
}

.token-preview {
  font-size: 10px;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  color: var(--text-tertiary);
  word-break: break-all;
}
</style>
