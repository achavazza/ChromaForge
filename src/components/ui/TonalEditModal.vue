<template>
  <Teleport to="body">
    <div v-if="modelValue" class="modal-overlay" @click="emit('close')">
      <div class="color-modal" @click.stop>
        <button class="modal-close-btn" @click="emit('close')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">RGB</span>
              <span class="modal-info-value-rgb">{{ getRGB(modelValue.hex) }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getRGB(modelValue.hex))" title="Copy RGB">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
            <div class="modal-info-item">
              <span class="modal-info-label">HSL</span>
              <span class="modal-info-value-rgb">{{ getHSL(modelValue.hex) }}</span>
              <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getHSL(modelValue.hex))" title="Copy HSL">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                <span class="copy-label">Copy</span>
              </button>
            </div>
          </div>
          <div class="modal-actions">
            <div class="modal-actions-row">
              <button v-if="hasEyeDropper" class="btn btn-secondary modal-action-btn" @click="pickEditColor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2 2-8 8H4v-2l8-8z"></path><path d="M14 4l6 6M9 15l2 2"></path></svg>
                Color Picker
              </button>
              <label class="btn btn-secondary modal-action-btn color-picker-label">
                <input v-if="modelValue" type="color" :value="modelValue.hex" @input="(e) => updateHex((e.target as HTMLInputElement).value.toUpperCase())" class="color-picker-input">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                Edit
              </label>
            </div>
            <div class="modal-actions-row">
              <button class="btn btn-secondary modal-action-btn" @click="cloneColor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                Clone
              </button>
              <button class="btn btn-danger modal-action-btn" @click="removeColor">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>
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
import { ref, onMounted } from 'vue'
import chroma from 'chroma-js'
import type { ColorEntry } from '../../stores/palette'

defineProps<{
  modelValue: ColorEntry | null
}>()

const emit = defineEmits<{
  close: []
  update: [hex: string]
  clone: []
  remove: []
}>()

const hasEyeDropper = ref(false)

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
})

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

function cloneColor() {
  emit('clone')
}

function removeColor() {
  emit('remove')
}

async function pickEditColor() {
  if (!('EyeDropper' in window)) return
  try {
    const eyeDropper = new (window as any).EyeDropper()
    const result = await eyeDropper.open()
    updateHex(result.sRGBHex.toUpperCase())
  } catch { /* ignore */ }
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
  width: 360px;
  max-width: 90vw;
  overflow: hidden;
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
