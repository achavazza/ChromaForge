<template>
  <div class="tonal-section">
    <div class="section-label">Tonal Scales</div>
    <div class="tonal-grid">
      <div v-for="color in colors" :key="color.id" class="tonal-row">
        <span class="tonal-name">{{ color.name || color.hex }}</span>
        <div class="tonal-swatches">
          <div
            v-for="(shade, i) in tonalScale(color.hex).scale"
            :key="i"
            class="tonal-swatch"
            :class="{ active: i === tonalScale(color.hex).activeIndex }"
            :style="{ background: shade }"
            :title="shade"
            @click="i === tonalScale(color.hex).activeIndex ? openPicker(color.id) : null"
          >
            <div v-if="i === tonalScale(color.hex).activeIndex" class="tonal-center-marker">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <TonalEditModal
    :model-value="editModalColor"
    @close="editModalColor = null"
    @update="onModalUpdate"
    @clone="onModalClone"
    @remove="onModalRemove"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ColorEntry } from '../../stores/palette'
import { usePaletteStore } from '../../stores/palette'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'
import TonalEditModal from './TonalEditModal.vue'

defineProps<{
  colors: ColorEntry[]
}>()

const palette = usePaletteStore()
const editModalColor = ref<ColorEntry | null>(null)

function tonalScale(hex: string) {
  return generateTonalScaleOKLCH(hex, 9)
}

function openPicker(colorId: string) {
  const color = palette.colors.find(c => c.id === colorId)
  if (color) editModalColor.value = { ...color }
}

function onModalUpdate(hex: string) {
  if (!editModalColor.value) return
  editModalColor.value = { ...editModalColor.value, hex }
  palette.updateColor(editModalColor.value.id, { hex })
}

function onModalClone() {
  if (!editModalColor.value) return
  palette.duplicateColor(editModalColor.value.id)
  editModalColor.value = null
}

function onModalRemove() {
  if (!editModalColor.value) return
  palette.removeColor(editModalColor.value.id)
  editModalColor.value = null
}
</script>

<style scoped>
.tonal-section {
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 16px;
  margin-top: 28px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 16px;
}

.tonal-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tonal-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tonal-name {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  width: 80px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tonal-swatches {
  display: flex;
  gap: 4px;
  flex: 1;
}

.tonal-swatch {
  flex: 1;
  height: 28px;
  border-radius: 5px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tonal-swatch:hover {
  transform: scaleY(1.15);
  z-index: 1;
}

.tonal-swatch.active {
  box-shadow: inset 0 0 0 2px var(--accent), 0 0 0 2px var(--accent-soft, rgba(99,102,241,0.3));
  transform: scaleY(1.1);
  z-index: 2;
}

.tonal-center-marker {
  color: rgba(255,255,255,0.6);
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));
  pointer-events: none;
}
</style>
