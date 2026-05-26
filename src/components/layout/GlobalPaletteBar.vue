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

    <ColorModal
      v-if="modalColor"
      :visible="!!modalColor"
      :color="modalColor"
      mode="edit"
      :show-roles="false"
      @close="modalColor = null"
      @update:hex="(hex) => palette.updateColor(modalColor!.id, { hex })"
      @clone="palette.duplicateColor(modalColor!.id)"
      @remove="() => { if (modalColor) palette.removeColor(modalColor.id); modalColor = null }"
    />

    <ColorModal
      v-if="showAddModal"
      :visible="showAddModal"
      :hex="newColorHex"
      mode="preview"
      @close="showAddModal = false"
      @add="(hex) => { palette.addColor(hex); showAddModal = false }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import chroma from 'chroma-js'
import { VueDraggable } from 'vue-draggable-plus'
import { usePaletteStore } from '../../stores/palette'
import type { ColorEntry } from '../../stores/palette'
import ColorModal from '../ui/ColorModal.vue'

const palette = usePaletteStore()
const reorderMode = ref(false)
const modalColor = ref<ColorEntry | null>(null)
const showAddModal = ref(false)
const newColorHex = ref('#6366F1')

function openModal(color: ColorEntry) {
  modalColor.value = color
}

function openAddModal() {
  newColorHex.value = chroma.random().hex()
  showAddModal.value = true
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


