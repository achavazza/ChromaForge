<template>
  <Teleport to="body">
    <div v-if="visible" class="modal-overlay" @click="emit('close')">
      <div class="color-modal" @click.stop>
        <button class="modal-close-btn" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
        </button>

        <div class="modal-swatch-area" :style="{ background: displayHex }">
          <span class="modal-swatch-hex">{{ displayHex }}</span>
        </div>

        <div class="modal-body">
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-info-label">HEX</span>
              <input
                v-if="editingField === 'hex'"
                ref="editInputRef"
                v-model="editBuffer"
                class="modal-input-edit"
                @keydown.enter="commitEdit"
                @keydown.escape="cancelEdit"
                @blur="commitEdit"
              />
              <span v-else class="modal-info-value" @click="startEdit('hex', displayHex)">{{ displayHex }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(displayHex)" title="Copy HEX">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">RGB</span>
              <input
                v-if="editingField === 'rgb'"
                ref="editInputRef"
                v-model="editBuffer"
                class="modal-input-edit"
                @keydown.enter="commitEdit"
                @keydown.escape="cancelEdit"
                @blur="commitEdit"
              />
              <span v-else class="modal-info-value" @click="startEdit('rgb', rgbStr)">{{ rgbStr }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(rgbStr)" title="Copy RGB">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">HSL</span>
              <input
                v-if="editingField === 'hsl'"
                ref="editInputRef"
                v-model="editBuffer"
                class="modal-input-edit"
                @keydown.enter="commitEdit"
                @keydown.escape="cancelEdit"
                @blur="commitEdit"
              />
              <span v-else class="modal-info-value" @click="startEdit('hsl', hslStr)">{{ hslStr }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(hslStr)" title="Copy HSL">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
          </div>

          <div v-if="showRoles && mode === 'edit' && color" class="modal-role-section">
            <div class="role-select-wrapper" ref="roleSelectRef">
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

          <div v-if="showHarmony" class="modal-harmony">
            <div class="harmony-label">Colors <span class="harmony-hint">(click to add)</span></div>
            <div class="harmony-groups">
              <div class="harmony-group">
                <span class="harmony-group-label">Complementary</span>
                <button class="harmony-dot-btn" @click="addHarmonyColor(getComplementary(displayHex))">
                  <span class="harmony-dot" :style="{ background: getComplementary(displayHex) }" />
                </button>
              </div>
              <div class="harmony-group">
                <span class="harmony-group-label">Analogous</span>
                <div class="harmony-dot-row">
                  <button class="harmony-dot-btn" @click="addHarmonyColor(getAnalogous(displayHex)[0])">
                    <span class="harmony-dot" :style="{ background: getAnalogous(displayHex)[0] }" />
                  </button>
                  <button class="harmony-dot-btn" @click="addHarmonyColor(getAnalogous(displayHex)[1])">
                    <span class="harmony-dot" :style="{ background: getAnalogous(displayHex)[1] }" />
                  </button>
                </div>
              </div>
              <div class="harmony-group">
                <span class="harmony-group-label">Triadic</span>
                <div class="harmony-dot-row">
                  <button class="harmony-dot-btn" @click="addHarmonyColor(getTriadic(displayHex)[0])">
                    <span class="harmony-dot" :style="{ background: getTriadic(displayHex)[0] }" />
                  </button>
                  <button class="harmony-dot-btn" @click="addHarmonyColor(getTriadic(displayHex)[1])">
                    <span class="harmony-dot" :style="{ background: getTriadic(displayHex)[1] }" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="showTonalScale" class="modal-scale">
            <div class="scale-row">
              <button
                v-for="(t, i) in tonalResult.scale"
                :key="i"
                class="scale-swatch"
                :class="{ active: i === tonalResult.activeIndex }"
                :style="{ background: t }"
                :title="t"
                @click="pendingTone = t"
              />
            </div>
            <div v-if="pendingTone" class="scale-confirm">
              <button class="btn btn-secondary btn-xs" @click="replaceTone">Replace</button>
              <button class="btn btn-secondary btn-xs" @click="addNewTone">Add</button>
              <button class="btn btn-ghost btn-icon-xs scale-cancel" @click="pendingTone = null">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <div class="modal-actions-row">
              <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickColor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                Color Picker
              </button>
              <label class="btn btn-secondary modal-action-btn color-picker-label">
                <input type="color" :value="displayHex" class="color-picker-input" @input="(e) => handleHexChange((e.target as HTMLInputElement).value)" />
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </label>
            </div>
            <div v-if="mode === 'edit'" class="modal-actions-row">
              <button class="btn btn-secondary modal-action-btn" @click="emit('clone')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Clone
              </button>
              <button class="btn btn-danger modal-action-btn" @click="emit('remove')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                Remove
              </button>
            </div>
            <div v-if="mode === 'preview'" class="modal-actions-row">
              <button class="btn btn-primary modal-action-btn" @click="emit('add', displayHex)" style="flex:1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add to Palette
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { usePaletteStore } from '../../stores/palette'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'
import { getComplementary, getAnalogous, getTriadic } from '../../composables/useColorHarmony'

const props = withDefaults(defineProps<{
  visible: boolean
  color?: ColorEntry | null
  hex?: string
  mode?: 'edit' | 'preview'
  showRoles?: boolean
  showHarmony?: boolean
  showTonalScale?: boolean
}>(), {
  color: null,
  hex: '#6366F1',
  mode: 'edit',
  showRoles: false,
  showHarmony: true,
  showTonalScale: true,
})

const emit = defineEmits<{
  close: []
  'update:hex': [hex: string]
  clone: []
  remove: []
  add: [hex: string]
}>()

const palette = usePaletteStore()

const displayHex = computed(() => {
  if (pendingTone.value) return pendingTone.value
  if (props.mode === 'edit' && props.color) return props.color.hex
  if (props.mode === 'preview' && localHex.value) return localHex.value
  return props.hex || '#6366F1'
})

const hasEyeDropper = ref(false)
const roleDropdownOpen = ref(false)
const roleSelectRef = ref<HTMLElement>()
const pendingTone = ref<string | null>(null)
const editingField = ref<'hex' | 'rgb' | 'hsl' | null>(null)
const editBuffer = ref('')
const editInputRef = ref<HTMLInputElement>()
const localHex = ref('')

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

const takenRoles = computed(() => {
  const taken = new Set<SemanticRole>()
  palette.colors.forEach(c => {
    if (props.color && c.id !== props.color.id) c.roles.forEach(r => taken.add(r))
  })
  return taken
})

const tonalResult = computed(() => generateTonalScaleOKLCH(displayHex.value, 9))

const rgbStr = computed(() => {
  try {
    const [r, g, b] = chroma(displayHex.value).rgb()
    return `rgb(${r}, ${g}, ${b})`
  } catch { return 'rgb(0, 0, 0)' }
})

const hslStr = computed(() => {
  try {
    const [h, s, l] = chroma(displayHex.value).hsl()
    return `hsl(${isNaN(h) ? 0 : Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  } catch { return 'hsl(0, 0%, 0%)' }
})

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
  document.addEventListener('click', onClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', onClickOutside)
})

function onClickOutside(e: MouseEvent) {
  if (roleSelectRef.value && !roleSelectRef.value.contains(e.target as Node)) {
    roleDropdownOpen.value = false
  }
}

function getRoleLabel(role: SemanticRole): string {
  for (const g of roleGroups) {
    const found = g.roles.find(r => r.value === role)
    if (found) return found.label
  }
  return role
}

function toggleRole(val: SemanticRole) {
  if (!props.color) return
  const roles = [...props.color.roles]
  const idx = roles.indexOf(val)
  if (idx >= 0) roles.splice(idx, 1)
  else {
    palette.colors.forEach(c => {
      if (c.id !== props.color!.id && c.roles.includes(val)) {
        (c as ColorEntry).roles = c.roles.filter(r => r !== val)
      }
    })
    roles.push(val)
  }
  palette.updateColor(props.color.id, { roles })
}

function handleHexChange(raw: string) {
  const hex = raw.startsWith('#') ? raw : '#' + raw
  try {
    const valid = chroma(hex).hex().toUpperCase()
    if (props.mode === 'edit' && props.color) {
      palette.updateColor(props.color.id, { hex: valid })
      emit('update:hex', valid)
    } else if (props.mode === 'preview') {
      localHex.value = valid
    }
  } catch { /* invalid */ }
}

function startEdit(field: 'hex' | 'rgb' | 'hsl', initial: string) {
  editingField.value = field
  editBuffer.value = initial
  nextTick(() => editInputRef.value?.focus())
}

function commitEdit() {
  if (!editingField.value) return
  const raw = editBuffer.value.trim()
  let hex: string | null = null
  try {
    if (editingField.value === 'hex') {
      const h = raw.startsWith('#') ? raw : '#' + raw
      if (/^#[0-9a-fA-F]{3,6}$/.test(h)) hex = chroma(h).hex().toUpperCase()
    } else if (editingField.value === 'rgb') {
      const nums = raw.replace(/rgb/i, '').replace(/[()]/g, '').split(',').map(s => Number(s.trim()))
      if (nums.length === 3 && nums.every(n => !isNaN(n) && n >= 0 && n <= 255)) hex = chroma(nums[0], nums[1], nums[2], 'rgb').hex().toUpperCase()
    } else if (editingField.value === 'hsl') {
      const parts = raw.replace(/hsl/i, '').replace(/[()]/g, '').split(',').map(s => s.trim())
      if (parts.length === 3) {
        const h = Number(parts[0]); const s = parseFloat(parts[1]) / 100; const l = parseFloat(parts[2]) / 100
        if (!isNaN(h) && !isNaN(s) && !isNaN(l) && s >= 0 && s <= 1 && l >= 0 && l <= 1) hex = chroma(h, s, l, 'hsl').hex().toUpperCase()
      }
    }
  } catch { /* invalid */ }
  if (hex && hex !== displayHex.value) {
    if (props.mode === 'edit' && props.color) {
      palette.updateColor(props.color.id, { hex })
      emit('update:hex', hex)
    } else if (props.mode === 'preview') {
      localHex.value = hex
    }
  }
  editingField.value = null
}

function cancelEdit() { editingField.value = null }

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) } catch { /* ignore */ }
}

async function pickColor() {
  if (!('EyeDropper' in window)) return
  try {
    const eyeDropper = new (window as any).EyeDropper()
    const result = await eyeDropper.open()
    handleHexChange(result.sRGBHex)
  } catch { /* ignore */ }
}

function replaceTone() {
  if (!pendingTone.value) return
  if (props.mode === 'edit' && props.color) {
    palette.updateColor(props.color.id, { hex: pendingTone.value })
    emit('update:hex', pendingTone.value)
  } else if (props.mode === 'preview') {
    localHex.value = pendingTone.value
  }
  pendingTone.value = null
}

function addNewTone() {
  if (!pendingTone.value) return
  emit('close')
  palette.addColor(pendingTone.value)
  pendingTone.value = null
}

function addHarmonyColor(hex: string) {
  emit('close')
  palette.addColor(hex)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; z-index: 9999;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.color-modal {
  background: var(--bg-primary); border-radius: 12px;
  width: 420px; max-width: 90vw; max-height: 90vh; overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}
.modal-close-btn {
  position: absolute; top: 8px; right: 8px; z-index: 10;
  background: rgba(0,0,0,0.35); border: none; border-radius: 50%;
  width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #fff; transition: background 0.15s;
}
.modal-close-btn:hover { background: rgba(0,0,0,0.55); }
.modal-swatch-area {
  position: relative; height: 140px;
  display: flex; align-items: flex-end; justify-content: center; padding-bottom: 12px;
}
.modal-swatch-hex {
  display: none;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px; color: var(--text-primary);
  background: rgba(255,255,255,0.85); padding: 3px 8px; border-radius: 4px;
}
.modal-body { padding: 16px; background: var(--bg-surface); }

.modal-info-grid {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px;
}
.modal-info-item {
  display: flex; align-items: center; gap: 8px;
  background: var(--bg-secondary); padding: 6px 10px; border-radius: 6px;
  border: 1px solid #eee;
}
.modal-info-label {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.5px; color: var(--text-secondary); width: 30px; flex-shrink: 0;
}
.modal-info-value {
  flex: 1; cursor: pointer;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px; color: var(--text-primary);
}
.modal-info-value:hover { color: var(--accent); }
.modal-input-edit {
  flex: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px; color: var(--text-primary);
  background: var(--bg-primary); border: 1px solid var(--accent);
  border-radius: 4px; padding: 2px 6px; outline: none; min-width: 0;
}
.modal-copy-btn {
  opacity: 0; transition: opacity 0.12s;
  display: flex; align-items: center; gap: 4px;
  padding: 2px 6px; font-size: 11px; color: var(--text-secondary);
  background: none; border: none; cursor: pointer; border-radius: 4px;
}
.modal-copy-btn:hover { background: var(--bg-tertiary); color: var(--text-primary); }
.copy-label { font-size: 10px; }
.modal-info-item:hover .modal-copy-btn { opacity: 1; }

.modal-role-section { margin-bottom: 12px; }
.role-select-wrapper { position: relative; }
.role-select-trigger {
  display: flex; align-items: center; justify-content: space-between; gap: 6px;
  width: 100%; padding: 8px 10px;
  background: var(--bg-secondary); border: 1px solid var(--border-primary);
  border-radius: 6px; cursor: pointer; color: var(--text-primary);
  font-size: 12px; transition: border-color 0.1s;
}
.role-select-trigger:hover { border-color: var(--border-strong); }
.role-select-placeholder { color: var(--text-tertiary); font-style: italic; }
.role-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.role-chip-inline {
  font-size: 10px; font-weight: 600; background: var(--accent-soft);
  color: var(--accent); padding: 2px 6px; border-radius: 4px;
}
.role-chevron { flex-shrink: 0; color: var(--text-tertiary); transition: transform 0.2s; }
.role-dropdown {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 20;
  margin-top: 4px; background: var(--bg-elevated);
  border: 1px solid var(--border-default); border-radius: 8px;
  padding: 6px; max-height: 240px; overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.role-group-block { margin-bottom: 4px; }
.role-group-block:last-child { margin-bottom: 0; }
.role-group-label {
  font-size: 9px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.08em; color: var(--text-tertiary); padding: 4px 6px 2px;
}
.role-item {
  display: flex; align-items: center; gap: 6px;
  width: 100%; padding: 5px 8px; border-radius: 5px;
  border: none; background: none; cursor: pointer;
  color: var(--text-primary); font-size: 12px; text-align: left; transition: background 0.1s;
}
.role-item:hover { background: var(--bg-subtle); }
.role-item.disabled { opacity: 0.4; cursor: not-allowed; }
.role-item.assigned { color: var(--accent); }
.role-item-icon { flex-shrink: 0; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
.icon-remove { color: var(--error); }
.icon-add { color: var(--accent); }
.role-item-label { font-size: 11px; font-weight: 500; }

.modal-harmony { margin-bottom: 12px; }
.harmony-label {
  font-size: 10px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.04em; color: var(--text-secondary); margin-bottom: 6px;
}
.harmony-hint { font-weight: 400; text-transform: none; color: var(--text-tertiary); }
.harmony-groups { display: flex; flex-direction: column; gap: 6px; }
.harmony-group { display: flex; align-items: center; gap: 8px; }
.harmony-group-label { font-size: 10px; color: var(--text-tertiary); width: 70px; flex-shrink: 0; }
.harmony-dot-row { display: flex; gap: 4px; }
.harmony-dot-btn { background: none; border: none; cursor: pointer; padding: 2px; border-radius: 4px; transition: background 0.1s; }
.harmony-dot-btn:hover { background: var(--bg-subtle); }
.harmony-dot { display: block; width: 20px; height: 20px; border-radius: 50%; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08); }

.modal-scale { margin-bottom: 12px; }
.scale-row { display: flex; gap: 3px; }
.scale-swatch { flex: 1; height: 20px; border: none; border-radius: 3px; cursor: pointer; transition: transform 0.12s; padding: 0; }
.scale-swatch:hover { transform: scaleY(1.3); }
.scale-swatch.active { outline: 2px solid var(--accent); outline-offset: 1px; }
.scale-confirm { display: flex; gap: 4px; margin-top: 4px; align-items: center; }
.scale-cancel { color: var(--text-tertiary); background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; }
.scale-cancel:hover { background: var(--bg-subtle); }

.modal-actions { display: flex; flex-direction: column; gap: 8px; }
.modal-actions-row { display: flex; gap: 8px; }
.modal-action-btn {
  flex: 1;
  justify-content: center;
}
.modal-action-btn.btn-danger {
  border-color: var(--error);
}
.color-picker-label { cursor: pointer; display: inline-flex; align-items: center; gap: 4px; }
.color-picker-input { position: absolute; opacity: 0; width: 1px; height: 1px; }
</style>
