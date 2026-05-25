<template>
  <div class="color-card" ref="cardRef">
    <!-- Top actions / Drag Handle (visible on hover) -->
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

    <!-- Color Preview Bar (click to open popup) -->
    <div class="color-preview" :style="{ background: color.hex }" @click="togglePopup">
      <div class="preview-overlay">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="3"/>
          <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2m0 16v2m9-9h-2M5 12H3"/>
        </svg>
      </div>
    </div>

    <!-- Color Info Modal -->
    <Teleport to="body">
      <div v-if="showPopup" class="modal-overlay" @click="showPopup = false">
        <div class="color-modal" @click.stop>
          <button class="modal-close-btn" @click="showPopup = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </button>

          <div class="modal-swatch-area" :style="{ background: color.hex }">
            <div class="modal-swatch-hex">{{ color.hex }}</div>
          </div>

          <div class="modal-body">
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="modal-info-label">HEX</span>
                <span class="modal-info-value">{{ color.hex }}</span>
                <button class="btn btn-ghost btn-icon-xs" @click="copy(color.hex)" title="Copy HEX">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">RGB</span>
                <span class="modal-info-value">{{ rgbStr }}</span>
                <button class="btn btn-ghost btn-icon-xs" @click="copy(rgbStr)" title="Copy RGB">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">HSL</span>
                <span class="modal-info-value">{{ hslStr }}</span>
                <button class="btn btn-ghost btn-icon-xs" @click="copy(hslStr)" title="Copy HSL">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-harmony">
              <div class="harmony-label">Colors <span class="harmony-hint">(click to add)</span></div>
              <div class="harmony-groups">
                <div class="harmony-group">
                  <span class="harmony-group-label">Complementary</span>
                  <button class="harmony-dot-btn" @click="openAddWithColor(compHex)" title="Add complementary">
                    <span class="harmony-dot" :style="{ background: compHex }" />
                  </button>
                </div>
                <div class="harmony-group">
                  <span class="harmony-group-label">Analogous</span>
                  <div class="harmony-dot-row">
                    <button class="harmony-dot-btn" title="Add analogous 1" @click="openAddWithColor(analogousHexes[0])">
                      <span class="harmony-dot" :style="{ background: analogousHexes[0] }" />
                    </button>
                    <button class="harmony-dot-btn" title="Add analogous 2" @click="openAddWithColor(analogousHexes[1])">
                      <span class="harmony-dot" :style="{ background: analogousHexes[1] }" />
                    </button>
                  </div>
                </div>
                <div class="harmony-group">
                  <span class="harmony-group-label">Triadic</span>
                  <div class="harmony-dot-row">
                    <button class="harmony-dot-btn" title="Add triadic 1" @click="openAddWithColor(triadicHexes[0])">
                      <span class="harmony-dot" :style="{ background: triadicHexes[0] }" />
                    </button>
                    <button class="harmony-dot-btn" title="Add triadic 2" @click="openAddWithColor(triadicHexes[1])">
                      <span class="harmony-dot" :style="{ background: triadicHexes[1] }" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-scale">
              <div class="scale-row">
                <button
                  v-for="(t, i) in colorScale"
                  :key="i"
                  class="scale-swatch"
                  :class="{ active: i === activeTonalIndex }"
                  :style="{ background: t }"
                  :title="t"
                  @click="pendingTone = t"
                />
              </div>
              <div v-if="pendingTone" class="scale-confirm">
                <button class="btn btn-secondary btn-xs" @click="replaceTone">Replace</button>
                <button class="btn btn-secondary btn-xs" @click="addNewTone">Add</button>
                <button class="btn btn-ghost btn-icon-xs scale-cancel" @click="pendingTone = null">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <div class="modal-actions-row">
                <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickColor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l2 2-8 8H4v-2l8-8z"/><path d="M14 4l6 6M9 15l2 2"/>
                  </svg>
                  Color Picker
                </button>
                <label class="btn btn-secondary modal-action-btn color-picker-label">
                  <input
                    type="color"
                    :value="color.hex"
                    class="color-picker-input"
                    @input="(e) => handleHexChange((e.target as HTMLInputElement).value)"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </label>
              </div>
              <div class="modal-actions-row">
                <button class="btn btn-secondary modal-action-btn" @click="emit('duplicate')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Clone
                </button>
                <button class="btn btn-danger modal-action-btn" @click="emit('remove'); showPopup = false">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
                  </svg>
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Card Body -->
    <div class="card-body">
      <div class="hex-field">
        <span class="field-prefix">#</span>
        <input
          class="hex-input-field"
          :value="color.hex.replace('#', '')"
          @change="(e) => handleHexChange('#' + (e.target as HTMLInputElement).value)"
          @blur="(e) => handleHexChange('#' + (e.target as HTMLInputElement).value)"
          maxlength="6"
          spellcheck="false"
          :id="`hex-input-${color.id}`"
        />
      </div>

      <div class="role-select-wrapper" :id="`role-select-${color.id}`" ref="roleSelectRef">
        <button class="role-select-trigger" @click="roleDropdownOpen = !roleDropdownOpen" type="button">
          <span v-if="color.roles.length === 0" class="role-select-placeholder">No Role</span>
          <span v-else class="role-chips">
            <span v-for="r in color.roles" :key="r" class="role-chip-inline">{{ getRoleLabel(r) }}</span>
          </span>
          <svg class="role-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
        </button>
        <div v-if="roleDropdownOpen" class="role-dropdown">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { usePaletteStore } from '../../stores/palette'
import { isValidHex } from '../../composables/useColorUtils'
import chroma from 'chroma-js'
import { getComplementary, getAnalogous, getTriadic } from '../../composables/useColorHarmony'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'

const palette = usePaletteStore()

interface Props {
  color: ColorEntry
  index: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  update: [updates: Partial<ColorEntry>]
  remove: []
  duplicate: []
  previewAdd: [hex: string]
}>()

const takenRoles = computed(() => {
  const s = new Set<SemanticRole>()
  palette.colors.forEach(c => {
    if (c.id !== props.color.id) c.roles.forEach(r => s.add(r))
  })
  return s
})

function toggleRole(role: SemanticRole) {
  const current = [...props.color.roles]
  const idx = current.indexOf(role)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    // Remove this role from any other color first
    palette.colors.forEach(c => {
      if (c.id !== props.color.id && c.roles.includes(role)) {
        (c as ColorEntry).roles = c.roles.filter(r => r !== role)
      }
    })
    current.push(role)
  }
  emit('update', { roles: current })
}

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

const hasEyeDropper = ref(false)
const showPopup = ref(false)
const pendingTone = ref<string | null>(null)
const roleDropdownOpen = ref(false)
const roleSelectRef = ref<HTMLElement>()

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

function onClickOutside(e: MouseEvent) {
  if (roleSelectRef.value && !roleSelectRef.value.contains(e.target as Node)) {
    roleDropdownOpen.value = false
  }
}

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function replaceTone() {
  if (!pendingTone.value) return
  emit('update', { hex: pendingTone.value })
  pendingTone.value = null
}

function addNewTone() {
  if (!pendingTone.value) return
  const hex = pendingTone.value
  pendingTone.value = null
  openAddWithColor(hex)
}

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
})

function togglePopup() {
  showPopup.value = !showPopup.value
}

function openAddWithColor(hex: string) {
  showPopup.value = false
  emit('previewAdd', hex)
}

const compHex = computed(() => getComplementary(props.color.hex))
const analogousHexes = computed(() => getAnalogous(props.color.hex))
const triadicHexes = computed(() => getTriadic(props.color.hex))
const tonalResult = computed(() => generateTonalScaleOKLCH(props.color.hex, 9))
const colorScale = computed(() => tonalResult.value.scale)
const activeTonalIndex = computed(() => tonalResult.value.activeIndex)

const rgbStr = computed(() => {
  try {
    const [r, g, b] = chroma(props.color.hex).rgb()
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return 'rgb(0, 0, 0)'
  }
})

const hslStr = computed(() => {
  try {
    const [h, s, l] = chroma(props.color.hex).hsl()
    return `hsl(${isNaN(h) ? 0 : Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  } catch {
    return 'hsl(0, 0%, 0%)'
  }
})

function handleHexChange(raw: string) {
  const hex = raw.startsWith('#') ? raw : '#' + raw
  if (isValidHex(hex)) {
    emit('update', { hex: hex.toUpperCase() })
  }
}

async function pickColor() {
  if (!('EyeDropper' in window)) return
  try {
    // @ts-ignore
    const eyeDropper = new window.EyeDropper()
    const result = await eyeDropper.open()
    handleHexChange(result.sRGBHex)
  } catch (e) {
    console.warn('EyeDropper cancelled or failed', e)
  }
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.warn('Clipboard write failed', e)
  }
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

.color-preview {
  width: 100%;
  height: 100px;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  border-radius: var(--radius) var(--radius) 0 0;
  overflow: hidden;
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

.hex-field {
  display: flex;
  align-items: center;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 6px;
  overflow: hidden;
}

.field-prefix {
  padding: 0 6px 0 8px;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary);
  font-weight: 600;
}

.hex-input-field {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 8px 6px 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  width: 100%;
  text-transform: uppercase;
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
</style>
