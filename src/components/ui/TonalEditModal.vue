<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="emit('close')">
      <div class="color-modal" @click.stop>
        <button class="modal-close-btn" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
        </button>
        <div class="modal-swatch-area" :style="{ background: modelValue.hex }">
          <span class="modal-swatch-hex">{{ modelValue.hex }}</span>
        </div>
        <div class="modal-body">
          <div class="modal-info-grid">
            <div class="modal-info-item">
              <span class="modal-info-label">HEX</span>
              <span class="modal-info-value">{{ modelValue.hex }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(modelValue.hex)" title="Copy HEX">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">RGB</span>
              <span class="modal-info-value-rgb">{{ getRGB(modelValue.hex) }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getRGB(modelValue.hex))" title="Copy RGB">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">HSL</span>
              <span class="modal-info-value-rgb">{{ getHSL(modelValue.hex) }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getHSL(modelValue.hex))" title="Copy HSL">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
          </div>

          <div class="modal-role-section">
            <div class="role-select-wrapper" ref="roleSelectRef">
              <button class="role-select-trigger" @click="roleDropdownOpen = !roleDropdownOpen" type="button">
                <span v-if="modelValue.roles.length === 0" class="role-select-placeholder">No Role</span>
                <span v-else class="role-chips">
                  <span v-for="r in modelValue.roles" :key="r" class="role-chip-inline">{{ getRoleLabel(r) }}</span>
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
                      assigned: modelValue.roles.includes(r.value),
                      disabled: takenRoles.has(r.value) && !modelValue.roles.includes(r.value)
                    }"
                    :disabled="takenRoles.has(r.value) && !modelValue.roles.includes(r.value)"
                    @click="toggleRole(r.value)"
                  >
                    <span class="role-item-icon">
                      <svg v-if="modelValue.roles.includes(r.value)" class="icon-remove" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                      <svg v-else class="icon-add" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </span>
                    <span class="role-item-label">{{ r.label }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-harmony">
            <div class="harmony-label">Harmony <span class="harmony-hint">(click to add)</span></div>
            <div class="harmony-groups">
              <div class="harmony-group">
                <span class="harmony-group-label">Complementary</span>
                <button class="harmony-dot-btn" @click="addHarmony(getComplementary(modelValue.hex))">
                  <span class="harmony-dot" :style="{ background: getComplementary(modelValue.hex) }" />
                </button>
              </div>
              <div class="harmony-group">
                <span class="harmony-group-label">Analogous</span>
                <div class="harmony-dot-row">
                  <button class="harmony-dot-btn" @click="addHarmony(getAnalogous(modelValue.hex)[0])">
                    <span class="harmony-dot" :style="{ background: getAnalogous(modelValue.hex)[0] }" />
                  </button>
                  <button class="harmony-dot-btn" @click="addHarmony(getAnalogous(modelValue.hex)[1])">
                    <span class="harmony-dot" :style="{ background: getAnalogous(modelValue.hex)[1] }" />
                  </button>
                </div>
              </div>
              <div class="harmony-group">
                <span class="harmony-group-label">Triadic</span>
                <div class="harmony-dot-row">
                  <button class="harmony-dot-btn" @click="addHarmony(getTriadic(modelValue.hex)[0])">
                    <span class="harmony-dot" :style="{ background: getTriadic(modelValue.hex)[0] }" />
                  </button>
                  <button class="harmony-dot-btn" @click="addHarmony(getTriadic(modelValue.hex)[1])">
                    <span class="harmony-dot" :style="{ background: getTriadic(modelValue.hex)[1] }" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-scale">
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
              <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickEditColor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 2-8 8H4v-2l8-8z"/><path d="M14 4l6 6M9 15l2 2"/></svg>
                Color Picker
              </button>
              <label class="btn btn-secondary modal-action-btn color-picker-label">
                <input v-if="modelValue" type="color" :value="modelValue.hex" @input="(e) => updateHex((e.target as HTMLInputElement).value.toUpperCase())" class="color-picker-input">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit
              </label>
            </div>
            <div class="modal-actions-row">
              <button class="btn btn-secondary modal-action-btn" @click="emit('clone')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Clone
              </button>
              <button class="btn btn-danger modal-action-btn" @click="emit('remove')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { usePaletteStore } from '../../stores/palette'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'

const props = defineProps<{
  modelValue: ColorEntry | null
}>()

const emit = defineEmits<{
  close: []
  update: [hex: string]
  clone: []
  remove: []
}>()

const palette = usePaletteStore()
const hasEyeDropper = ref(false)
const roleDropdownOpen = ref(false)
const roleSelectRef = ref<HTMLElement>()
const pendingTone = ref<string | null>(null)

const roleGroups: { label: string; roles: { value: SemanticRole; label: string }[] }[] = [
  { label: 'Layout', roles: [{ value: 'background', label: 'Background' }, { value: 'surface', label: 'Surface' }] },
  { label: 'Brand', roles: [{ value: 'primary', label: 'Primary' }, { value: 'secondary', label: 'Secondary' }, { value: 'tertiary', label: 'Tertiary' }, { value: 'accent', label: 'Accent' }, { value: 'accent-hover', label: 'Accent Hover' }] },
  { label: 'Feedback', roles: [{ value: 'success', label: 'Success' }, { value: 'warning', label: 'Warning' }, { value: 'error', label: 'Error' }, { value: 'info', label: 'Info' }] },
  { label: 'Content', roles: [{ value: 'text-primary', label: 'Text Primary' }, { value: 'text-secondary', label: 'Text Secondary' }, { value: 'muted', label: 'Muted' }, { value: 'border', label: 'Border' }] },
  { label: 'Neutral', roles: [{ value: 'neutral', label: 'Neutral' }, { value: 'neutral-dark', label: 'Neutral Dark' }, { value: 'neutral-light', label: 'Neutral Light' }] },
]

const takenRoles = computed(() => {
  const taken = new Set<SemanticRole>()
  palette.colors.forEach(c => { c.roles.forEach(r => taken.add(r)) })
  if (props.modelValue) props.modelValue.roles.forEach(r => taken.delete(r))
  return taken
})

const tonalResult = computed(() => {
  if (!props.modelValue) return { scale: [], activeIndex: 0 }
  return generateTonalScaleOKLCH(props.modelValue.hex)
})

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
  document.addEventListener('click', onClickOutside)
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
  const roles = [...props.modelValue!.roles]
  const idx = roles.indexOf(val)
  if (idx >= 0) roles.splice(idx, 1)
  else roles.push(val)
  palette.updateColor(props.modelValue!.id, { roles })
}

function getRGB(hex: string) {
  try {
    const [r, g, b] = chroma(hex).rgb()
    return `rgb(${r}, ${g}, ${b})`
  } catch { return 'rgb(0, 0, 0)' }
}

function getHSL(hex: string) {
  try {
    const [h, s, l] = chroma(hex).hsl()
    return `hsl(${isNaN(h) ? 0 : Math.round(h)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
  } catch { return 'hsl(0, 0%, 0%)' }
}

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text) }
  catch { /* ignore */ }
}

function updateHex(hex: string) {
  emit('update', hex)
}

async function pickEditColor() {
  if (!('EyeDropper' in window)) return
  try {
    const eyeDropper = new (window as any).EyeDropper()
    const result = await eyeDropper.open()
    updateHex(result.sRGBHex.toUpperCase())
  } catch { /* ignore */ }
}

function getComplementary(hex: string): string {
  try { return chroma(hex).set('hsl.h', (chroma(hex).get('hsl.h') + 180) % 360).hex().toUpperCase() }
  catch { return hex }
}

function getAnalogous(hex: string): [string, string] {
  try {
    const h = chroma(hex).get('hsl.h')
    return [
      chroma(hex).set('hsl.h', ((h - 30) + 360) % 360).hex().toUpperCase(),
      chroma(hex).set('hsl.h', ((h + 30)) % 360).hex().toUpperCase(),
    ]
  } catch { return [hex, hex] }
}

function getTriadic(hex: string): [string, string] {
  try {
    const h = chroma(hex).get('hsl.h')
    return [
      chroma(hex).set('hsl.h', ((h + 120)) % 360).hex().toUpperCase(),
      chroma(hex).set('hsl.h', ((h + 240)) % 360).hex().toUpperCase(),
    ]
  } catch { return [hex, hex] }
}

function addHarmony(hex: string) {
  emit('close')
  palette.addColor(hex)
}

function replaceTone() {
  if (!props.modelValue || !pendingTone.value) return
  updateHex(pendingTone.value)
  pendingTone.value = null
}

function addNewTone() {
  if (!pendingTone.value) return
  emit('close')
  palette.addColor(pendingTone.value)
  pendingTone.value = null
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.color-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  width: 420px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
}

.modal-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 10;
  background: rgba(0,0,0,0.35);
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  transition: background 0.15s;
}
.modal-close-btn:hover { background: rgba(0,0,0,0.55); }

.modal-swatch-area {
  position: relative;
  height: 140px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 12px;
}

.modal-swatch-hex {
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 13px;
  color: var(--text-primary);
  background: rgba(255,255,255,0.85);
  padding: 3px 8px;
  border-radius: 4px;
}

.modal-body {
  padding: 16px;
  background: var(--bg-surface);
}

.modal-info-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.modal-info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-secondary);
  padding: 6px 10px;
  border-radius: 6px;
}

.modal-info-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  width: 30px;
  flex-shrink: 0;
}

.modal-info-value,
.modal-info-value-rgb {
  flex: 1;
  font-family: 'SF Mono', 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 12px;
  color: var(--text-primary);
}

.modal-copy-btn {
  opacity: 0;
  transition: opacity 0.12s;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  font-size: 11px;
  color: var(--text-secondary);
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

.modal-copy-btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.copy-label { font-size: 10px; }

.modal-info-item:hover .modal-copy-btn { opacity: 1; }

.modal-role-section {
  margin-bottom: 12px;
}

.role-select-wrapper {
  position: relative;
}

.role-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  width: 100%;
  padding: 8px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 12px;
  transition: border-color 0.1s;
}

.role-select-trigger:hover {
  border-color: var(--border-strong);
}

.role-select-placeholder {
  color: var(--text-tertiary);
  font-style: italic;
}

.role-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.role-chip-inline {
  font-size: 10px;
  font-weight: 600;
  background: var(--accent-soft);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: 4px;
}

.role-chevron {
  flex-shrink: 0;
  color: var(--text-tertiary);
  transition: transform 0.2s;
}

.role-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  margin-top: 4px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 6px;
  max-height: 240px;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.role-group-block {
  margin-bottom: 4px;
}

.role-group-block:last-child { margin-bottom: 0; }

.role-group-label {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  padding: 4px 6px 2px;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 5px 8px;
  border-radius: 5px;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-primary);
  font-size: 12px;
  text-align: left;
  transition: background 0.1s;
}

.role-item:hover { background: var(--bg-subtle); }
.role-item.disabled { opacity: 0.4; cursor: not-allowed; }
.role-item.assigned { color: var(--accent); }
.role-item-icon { flex-shrink: 0; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center; }
.icon-remove { color: var(--error); }
.icon-add { color: var(--accent); }
.role-item-label { font-size: 11px; font-weight: 500; }

.modal-harmony {
  margin-bottom: 12px;
}

.harmony-label {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.harmony-hint {
  font-weight: 400;
  text-transform: none;
  color: var(--text-tertiary);
}

.harmony-groups {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.harmony-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.harmony-group-label {
  font-size: 10px;
  color: var(--text-tertiary);
  width: 70px;
  flex-shrink: 0;
}

.harmony-dot-row {
  display: flex;
  gap: 4px;
}

.harmony-dot-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  transition: background 0.1s;
}

.harmony-dot-btn:hover {
  background: var(--bg-subtle);
}

.harmony-dot {
  display: block;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}

.modal-scale {
  margin-bottom: 12px;
}

.scale-row {
  display: flex;
  gap: 3px;
}

.scale-swatch {
  flex: 1;
  height: 20px;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: transform 0.12s;
  padding: 0;
}

.scale-swatch:hover { transform: scaleY(1.3); }
.scale-swatch.active { outline: 2px solid var(--accent); outline-offset: 1px; }

.scale-confirm {
  display: flex;
  gap: 4px;
  margin-top: 4px;
  align-items: center;
}

.scale-cancel {
  color: var(--text-tertiary);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
}

.scale-cancel:hover { background: var(--bg-subtle); }

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-actions-row {
  display: flex;
  gap: 8px;
}

.modal-action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border-primary);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.12s;
  background: var(--bg-primary);
  color: var(--text-primary);
}

.modal-action-btn:hover { background: var(--bg-secondary); }

.modal-action-btn.btn-danger {
  color: var(--error);
  border-color: var(--error);
}

.modal-action-btn.btn-danger:hover {
  background: var(--error);
  color: #fff;
}

.color-picker-label {
  position: relative;
  cursor: pointer;
}

.color-picker-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}
</style>
