<template>
  <div class="global-palette-bar">
    <div class="bar-container">
      <!-- Color swatches: plain div when not reordering, VueDraggable when reordering -->
      <div v-if="!reorderMode" class="palette-strip">
        <div
          v-for="color in palette.colors"
          :key="color.id"
          class="strip-item-wrapper"
        >
          <div class="strip-item" @click="openModal(color)">
            <div class="strip-swatch" :style="{ background: color.hex }" />
          </div>
        </div>
      </div>

      <VueDraggable
        v-else
        v-model="palette.colors"
        class="palette-strip"
        :animation="150"
        handle=".drag-handle"
      >
        <div
          v-for="color in palette.colors"
          :key="color.id"
          class="strip-item-wrapper"
        >
          <div class="drag-handle" title="Drag to reorder">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
              <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
            </svg>
          </div>
          <div class="strip-item" @click="openModal(color)">
            <div class="strip-swatch" :style="{ background: color.hex }" />
          </div>
        </div>
      </VueDraggable>

      <button class="add-color-btn" @click="openAddModal" title="Add Color">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <button
        class="reorder-toggle"
        :class="{ active: reorderMode }"
        @click="reorderMode = !reorderMode"
        :title="reorderMode ? 'Exit reorder mode' : 'Enter reorder mode'"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="9" cy="5" r="1"/><circle cx="9" cy="12" r="1"/><circle cx="9" cy="19" r="1"/>
          <circle cx="15" cy="5" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="19" r="1"/>
        </svg>
        Reorder
      </button>
    </div>

    <!-- Modal Overlay -->
    <Teleport to="body">
      <div v-if="modalColor" class="modal-overlay" @click="closeModal">
        <div class="color-modal" @click.stop>
          <button class="modal-close-btn" @click="closeModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </button>

          <div class="modal-swatch-area" :style="{ background: modalColor.hex }">
            <div class="modal-swatch-hex">{{ modalColor.hex }}</div>
          </div>

          <div class="modal-body">
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="modal-info-label">HEX</span>
                <span class="modal-info-value">{{ modalColor.hex }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(modalColor.hex)" title="Copy HEX">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">RGB</span>
                <span class="modal-info-value-rgb">{{ getRGB(modalColor.hex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getRGB(modalColor.hex))" title="Copy RGB">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">HSL</span>
                <span class="modal-info-value-rgb">{{ getHSL(modalColor.hex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getHSL(modalColor.hex))" title="Copy HSL">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
            </div>

            <div class="modal-role-section">
              <div class="role-select-wrapper" ref="modalRoleSelectRef">
                <button class="role-select-trigger" @click="modalRoleDropdownOpen = !modalRoleDropdownOpen" type="button">
                  <span v-if="modalColor.roles.length === 0" class="role-select-placeholder">No Role</span>
                  <span v-else class="role-chips">
                    <span v-for="r in modalColor.roles" :key="r" class="role-chip-inline">{{ getRoleLabel(r) }}</span>
                  </span>
                  <svg class="role-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                <div v-if="modalRoleDropdownOpen" class="role-dropdown">
                  <div v-for="g in roleGroups" :key="g.label" class="role-group-block">
                    <div class="role-group-label">{{ g.label }}</div>
                    <button
                      v-for="r in g.roles"
                      :key="r.value"
                      class="role-item"
                      :class="{
                        assigned: modalColor.roles.includes(r.value),
                        disabled: modalTakenRoles.has(r.value) && !modalColor.roles.includes(r.value)
                      }"
                      :disabled="modalTakenRoles.has(r.value) && !modalColor.roles.includes(r.value)"
                      @click="toggleModalRole(r.value)"
                    >
                      <span class="role-item-icon">
                        <svg v-if="modalColor.roles.includes(r.value)" class="icon-remove" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                        <svg v-else class="icon-add" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </span>
                      <span class="role-item-label">{{ r.label }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-harmony">
              <div class="harmony-label">Colors <span class="harmony-hint">(click to add)</span></div>
              <div class="harmony-groups">
                <div class="harmony-group">
                  <span class="harmony-group-label">Complementary</span>
                  <button class="harmony-dot-btn" @click="openAddWithColor(getComplementary(modalColor!.hex))" title="Add complementary">
                    <span class="harmony-dot" :style="{ background: getComplementary(modalColor!.hex) }" />
                  </button>
                </div>
                <div class="harmony-group">
                  <span class="harmony-group-label">Analogous</span>
                  <div class="harmony-dot-row">
                    <button class="harmony-dot-btn" title="Add analogous 1" @click="openAddWithColor(getAnalogous(modalColor!.hex)[0])">
                      <span class="harmony-dot" :style="{ background: getAnalogous(modalColor!.hex)[0] }" />
                    </button>
                    <button class="harmony-dot-btn" title="Add analogous 2" @click="openAddWithColor(getAnalogous(modalColor!.hex)[1])">
                      <span class="harmony-dot" :style="{ background: getAnalogous(modalColor!.hex)[1] }" />
                    </button>
                  </div>
                </div>
                <div class="harmony-group">
                  <span class="harmony-group-label">Triadic</span>
                  <div class="harmony-dot-row">
                    <button class="harmony-dot-btn" title="Add triadic 1" @click="openAddWithColor(getTriadic(modalColor!.hex)[0])">
                      <span class="harmony-dot" :style="{ background: getTriadic(modalColor!.hex)[0] }" />
                    </button>
                    <button class="harmony-dot-btn" title="Add triadic 2" @click="openAddWithColor(getTriadic(modalColor!.hex)[1])">
                      <span class="harmony-dot" :style="{ background: getTriadic(modalColor!.hex)[1] }" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-scale">
              <div class="scale-row">
                <button
                  v-for="(t, i) in modalTonalResult.scale"
                  :key="i"
                  class="scale-swatch"
                  :class="{ active: i === modalTonalResult.activeIndex }"
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
                <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickColor(modalColor.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l2 2-8 8H4v-2l8-8z"/><path d="M14 4l6 6M9 15l2 2"/>
                  </svg>
                  Color Picker
                </button>
                <label class="btn btn-secondary modal-action-btn color-picker-label">
                  <input
                    type="color"
                    :value="modalColor.hex"
                    class="color-picker-input"
                    @input="(e) => handleHexInput((e.target as HTMLInputElement).value)"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </label>
              </div>
              <div class="modal-actions-row">
                <button class="btn btn-secondary modal-action-btn" @click="cloneColor(modalColor.id)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Clone
                </button>
                <button class="btn btn-danger modal-action-btn" @click="removeAndClose(modalColor.id)">
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

    <!-- Add Color Modal -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-overlay" @click="showAddModal = false">
        <div class="color-modal" @click.stop>
          <button class="modal-close-btn" @click="showAddModal = false">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </button>

          <div class="modal-swatch-area" :style="{ background: newColorHex }">
            <div class="modal-swatch-hex">{{ newColorHex }}</div>
          </div>

           <div class="modal-body">
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="modal-info-label">HEX</span>
                <span class="modal-info-value">{{ newColorHex }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(newColorHex)" title="Copy HEX">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">RGB</span>
                <span class="modal-info-value-rgb">{{ getRGB(newColorHex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getRGB(newColorHex))" title="Copy RGB">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">HSL</span>
                <span class="modal-info-value-rgb">{{ getHSL(newColorHex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getHSL(newColorHex))" title="Copy HSL">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
            </div>

            <div class="modal-actions">
              <div class="modal-actions-row">
                <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickColorNew">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2l2 2-8 8H4v-2l8-8z"/><path d="M14 4l6 6M9 15l2 2"/>
                  </svg>
                  Color Picker
                </button>
                <label class="btn btn-secondary modal-action-btn color-picker-label">
                  <input
                    type="color"
                    :value="newColorHex"
                    class="color-picker-input"
                    @input="(e) => newColorHex = (e.target as HTMLInputElement).value.toUpperCase()"
                  />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </label>
              </div>
              <div class="modal-actions-row">
                <button class="btn btn-primary modal-action-btn" @click="addNewColor" style="flex:1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Add to Palette
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import { VueDraggable } from 'vue-draggable-plus'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { getComplementary, getAnalogous, getTriadic } from '../../composables/useColorHarmony'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'

const palette = usePaletteStore()
const hasEyeDropper = ref(false)
const reorderMode = ref(false)
const modalColor = ref<ColorEntry | null>(null)
const showAddModal = ref(false)
const newColorHex = ref('#6366F1')
const pendingTone = ref<string | null>(null)
const modalRoleDropdownOpen = ref(false)
const modalRoleSelectRef = ref<HTMLElement>()
const modalTonalResult = computed(() => modalColor.value ? generateTonalScaleOKLCH(modalColor.value.hex, 9) : { scale: [] as string[], activeIndex: -1 })

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

const modalTakenRoles = computed(() => {
  const s = new Set<SemanticRole>()
  if (!modalColor.value) return s
  palette.colors.forEach(c => {
    if (c.id !== modalColor.value!.id) c.roles.forEach(r => s.add(r))
  })
  return s
})

function toggleModalRole(role: SemanticRole) {
  if (!modalColor.value) return
  const current = [...modalColor.value.roles]
  const idx = current.indexOf(role)
  if (idx >= 0) {
    current.splice(idx, 1)
  } else {
    palette.colors.forEach(c => {
      if (c.id !== modalColor.value!.id && c.roles.includes(role)) {
        (c as ColorEntry).roles = c.roles.filter(r => r !== role)
      }
    })
    current.push(role)
  }
  palette.updateColor(modalColor.value.id, { roles: current })
}

function onModalClickOutside(e: MouseEvent) {
  if (modalRoleSelectRef.value && !modalRoleSelectRef.value.contains(e.target as Node)) {
    modalRoleDropdownOpen.value = false
  }
}

function replaceTone() {
  if (!pendingTone.value || !modalColor.value) return
  handleHexChange(modalColor.value.id, pendingTone.value)
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
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('click', onModalClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('click', onModalClickOutside)
})

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    modalColor.value = null
    showAddModal.value = false
  }
}

function openModal(color: ColorEntry) {
  modalColor.value = color
}

function closeModal() {
  modalColor.value = null
}

function openAddModal() {
  showAddModal.value = true
}

function handleHexChange(id: string, hex: string) {
  palette.updateColor(id, { hex: hex.toUpperCase() })
}

function handleHexInput(hex: string) {
  if (modalColor.value) handleHexChange(modalColor.value.id, hex)
}

function removeAndClose(id: string) {
  palette.removeColor(id)
  modalColor.value = null
}

function cloneColor(id: string) {
  palette.duplicateColor(id)
}

async function pickColor(id: string) {
  if (!('EyeDropper' in window)) return
  try {
    // @ts-ignore
    const eyeDropper = new window.EyeDropper()
    const result = await eyeDropper.open()
    handleHexChange(id, result.sRGBHex)
  } catch (e) {
    console.warn('EyeDropper cancelled or failed', e)
  }
}

async function pickColorNew() {
  if (!('EyeDropper' in window)) return
  try {
    // @ts-ignore
    const eyeDropper = new window.EyeDropper()
    const result = await eyeDropper.open()
    newColorHex.value = result.sRGBHex.toUpperCase()
  } catch (e) {
    console.warn('EyeDropper cancelled or failed', e)
  }
}

function openAddWithColor(hex: string) {
  closeModal()
  nextTick(() => {
    newColorHex.value = hex
    showAddModal.value = true
  })
}

function addNewColor() {
  palette.addColor(newColorHex.value)
  showAddModal.value = false
  newColorHex.value = '#6366F1'
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
  } catch (e) {
    console.warn('Clipboard write failed', e)
  }
}

function getRGB(hex: string) {
  try {
    const [r, g, b] = chroma(hex).rgb()
    return `rgb(${r}, ${g}, ${b})`
  } catch {
    return 'rgb(0, 0, 0)'
  }
}

function getHSL(hex: string) {
  try {
    const [h, s, l] = chroma(hex).hsl()
    return `hsl(${isNaN(h) ? 0 : Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  } catch {
    return 'hsl(0, 0%, 0%)'
  }
}
</script>

<style scoped>
.global-palette-bar {
  position: fixed;
  bottom: 0;
  left: 260px;
  right: 0;
  height: 64px;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-default);
  z-index: 100;
  display: flex;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.03);
}

.bar-container {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  overflow-x: auto;
  overflow-y: visible;
  padding: 10px 0;
}

.bar-container::-webkit-scrollbar { display: none; }
.bar-container { -ms-overflow-style: none; scrollbar-width: none; }

.palette-strip {
  display: flex;
  align-items: center;
  gap: 4px;
}

.strip-item-wrapper {
  display: flex;
  align-items: center;
  gap: 2px;
}

.drag-handle {
  cursor: grab;
  color: var(--text-tertiary);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.drag-handle:active { cursor: grabbing; }

.strip-item {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  padding: 3px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.15s;
}

.strip-item:hover {
  background: var(--bg-subtle);
  border-color: var(--border-subtle);
}

.strip-swatch {
  width: 100%;
  height: 100%;
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), var(--shadow-sm);
}

.add-color-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: transparent;
  border: 1px dashed var(--border-strong);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}

.add-color-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.reorder-toggle {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
  white-space: nowrap;
  font-family: inherit;
  margin-left: auto;
}

.reorder-toggle:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.reorder-toggle.active {
  background: var(--accent-soft);
  color: var(--accent);
  border-color: var(--accent);
}
</style>

<style>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.color-modal {
  width: 420px;
  max-width: 90vw;
  background: var(--bg-surface);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(0,0,0,0.4);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.15s;
}

.modal-close-btn:hover {
  background: rgba(0,0,0,0.6);
}

.modal-swatch-area {
  height: 200px;
  display: flex;
  align-items: flex-end;
  padding: 16px;
}

.modal-swatch-hex {
  font-family: 'JetBrains Mono', monospace;
  font-size: 24px;
  font-weight: 800;
  color: white;
  text-shadow: 0 2px 12px rgba(0,0,0,0.5);
  letter-spacing: -0.02em;
}

.modal-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-info-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  background: var(--bg-subtle);
  border-radius: 8px;
}

.modal-info-item:hover .modal-copy-btn {
  opacity: 1;
}

.modal-info-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: 32px;
  flex-shrink: 0;
}

.modal-info-value {
  font-size: 13px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-primary);
  flex: 1;
}

.modal-info-value-rgb {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-secondary);
  flex: 1;
}

.modal-copy-btn {
  opacity: 0;
  transition: opacity 0.15s;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 3px;
  margin-left: auto;
}

.copy-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.modal-role-section {
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-actions-row {
  display: flex;
  gap: 6px;
}

.modal-action-btn {
  flex: 1;
  justify-content: center;
  padding: 8px 10px;
  font-size: 11px;
}

.color-picker-label {
  position: relative;
  cursor: pointer;
}

.color-picker-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.btn-icon-xs {
  padding: 4px;
  border-radius: 4px;
  flex-shrink: 0;
}

.modal-scale {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.scale-row {
  display: flex;
  gap: 3px;
  border-radius: 8px;
  overflow: hidden;
  height: 28px;
}

.scale-swatch {
  flex: 1;
  border: none;
  cursor: pointer;
  transition: all 0.12s;
  position: relative;
}

.scale-swatch:hover {
  transform: scaleY(1.2);
  z-index: 1;
  box-shadow: 0 0 0 2px var(--accent), 0 2px 8px rgba(0,0,0,0.2);
  border-radius: 3px;
}

.scale-swatch.active {
  box-shadow: inset 0 0 0 2px white, inset 0 0 0 3px rgba(0,0,0,0.2);
  z-index: 1;
}

.scale-confirm {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 0;
}

.scale-cancel {
  margin-left: auto;
  flex-shrink: 0;
}

.btn-xs {
  padding: 3px 8px;
  font-size: 10px;
  border-radius: 4px;
  font-family: inherit;
}

.modal-harmony {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.harmony-label {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.harmony-hint {
  font-weight: 400;
  color: var(--text-tertiary);
  text-transform: none;
  letter-spacing: normal;
}

.harmony-groups {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.harmony-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.harmony-group-label {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  min-width: 80px;
  flex-shrink: 0;
}

.harmony-dot-row {
  display: flex;
  gap: 4px;
}

.harmony-dot-btn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  padding: 0;
  border: 2px solid transparent;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.harmony-dot-btn:hover {
  border-color: var(--accent);
  transform: scale(1.15);
}

.harmony-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.15);
}

.role-select-wrapper {
  position: relative;
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
