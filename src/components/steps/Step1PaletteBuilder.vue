<template>
  <div class="step-root animate-fade-in">
    <!-- Page header -->
    <div class="step-header">
      <div>
        <h1 class="step-title">Palette Builder</h1>
        <p class="step-subtitle">Build your color palette. Assign semantic roles, name each color, and organize freely.</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" @click="showImport = true" id="import-palette-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Import Palette
        </button>
        <button class="btn btn-primary" @click="openAddPreview" id="add-color-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Color
        </button>
        <button v-if="palette.colors.length > 0" class="btn btn-primary" @click="newPalette" id="new-palette-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 3h.01M12 7h.01M12 11h.01M12 15h.01M12 19h.01"/>
            <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="7" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="11" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
            <circle cx="12" cy="19" r="1.5" fill="currentColor"/>
          </svg>
          New Palette
        </button>
        <button v-if="palette.colors.length > 0" class="btn btn-ghost btn-danger" @click="clearAll" id="clear-all-btn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Clear All
        </button>
      </div>
    </div>

    <!-- Color grid -->
    <div class="color-grid">
      <VueDraggable
        v-model="palette.colors"
        class="color-list"
        :animation="150"
        handle=".drag-handle"
      >
        <ColorCard
          v-for="(color, idx) in palette.colors"
          :key="color.id"
          :color="color"
          :index="idx"
          @update="(updates) => palette.updateColor(color.id, updates)"
          @remove="palette.removeColor(color.id)"
          @duplicate="palette.duplicateColor(color.id)"
        />
      </VueDraggable>
    </div>

    <!-- Empty state -->
    <div v-if="palette.colors.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <circle cx="13.5" cy="6.5" r="2.5"/>
          <circle cx="17.5" cy="10.5" r="2.5"/>
          <circle cx="8.5" cy="7.5" r="2.5"/>
          <circle cx="6.5" cy="12.5" r="2.5"/>
          <path d="M12 20a8 8 0 1 0 0-16"/>
        </svg>
      </div>
      <p class="empty-text">No colors yet</p>
      <p class="empty-sub">Click "Add Color" or import a palette to get started</p>
    </div>

    <!-- Saved palettes -->
    <div class="palette-strip-section">
      <div class="section-label">
        <span>Saved Palettes</span>
        <button class="save-btn" @click="savePalette" :disabled="palette.colors.length === 0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save Current
        </button>
      </div>
      <div v-if="savedPalettes.length === 0" class="empty-saved">
        No saved palettes yet. Build a palette and click "Save Current".
      </div>
      <div v-else class="presets-grid">
        <div
          v-for="(sp, idx) in savedPalettes"
          :key="idx"
          class="saved-palette-card"
        >
          <button class="preset-btn" @click="applySavedPalette(sp.colors)" :title="sp.label || 'Saved palette'">
            <div class="preset-bars">
              <div
                v-for="(hex, hi) in sp.colors"
                :key="hi"
                class="preset-bar"
                :style="{ background: hex }"
              />
            </div>
            <span class="preset-name">{{ sp.label || 'Saved palette' }}</span>
            <span class="preset-count">{{ sp.colors.length }} color{{ sp.colors.length !== 1 ? 's' : '' }}</span>
          </button>
          <button class="delete-saved-btn" @click="deleteSavedPalette(idx)" title="Delete">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <ColorModal
      v-if="showAddPreview"
      :visible="showAddPreview"
      :hex="addPreviewHex"
      mode="preview"
      @close="showAddPreview = false"
      @add="(hex) => { palette.addColor(hex); showAddPreview = false }"
    />

    <!-- Import Modal -->
    <ImportModal v-if="showImport" @close="showImport = false" @import="onImport" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import ColorCard from '../ui/ColorCard.vue'
import ColorModal from '../ui/ColorModal.vue'
import ImportModal from '../ui/ImportModal.vue'
import { parseHexInput } from '../../composables/useColorUtils'
import { VueDraggable } from 'vue-draggable-plus'

interface SavedPalette {
  label: string
  colors: string[]
}

const palette = usePaletteStore()
const showImport = ref(false)
const showAddPreview = ref(false)
const addPreviewHex = ref('#6366F1')

const savedPalettes = ref<SavedPalette[]>(
  JSON.parse(localStorage.getItem('chromaforge-saved') || '[]')
)

function savePalette() {
  const hexes = palette.colors.map(c => c.hex)
  if (!hexes.length) return
  const label = window.prompt('Name this palette:', `Palette ${savedPalettes.value.length + 1}`)
  if (!label) return
  savedPalettes.value.push({ label, colors: hexes })
  localStorage.setItem('chromaforge-saved', JSON.stringify(savedPalettes.value))
}

function deleteSavedPalette(idx: number) {
  savedPalettes.value.splice(idx, 1)
  localStorage.setItem('chromaforge-saved', JSON.stringify(savedPalettes.value))
}

function applySavedPalette(hexes: string[]) {
  palette.reorderColors([])
  hexes.forEach(hex => palette.addColor(hex))
}

function newPalette() {
  if (palette.colors.length === 0) return
  if (window.confirm('Start a new palette? All current colors will be cleared.')) {
    palette.clearAll()
  }
}

function clearAll() {
  if (palette.colors.length === 0) return
  if (window.confirm('Remove all colors from the palette?')) {
    palette.clearAll()
  }
}

function openAddPreview() {
  addPreviewHex.value = chroma.random().hex()
  showAddPreview.value = true
}

function onImport(raw: string) {
  const hexList = parseHexInput(raw)
  palette.importColors(hexList)
  showImport.value = false
}
</script>

<style scoped>
.step-root {
  max-width: 960px;
  margin: 0 auto;
}

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
  line-height: 1.2;
  margin-bottom: 6px;
}

.step-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.6;
}

.header-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.color-grid {
  margin-bottom: 32px;
}

.color-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

/* TransitionGroup animations */
.color-card-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.color-card-leave-active {
  transition: all 0.2s ease;
}
.color-card-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.97);
}
.color-card-leave-to {
  opacity: 0;
  transform: translateX(16px) scale(0.97);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  text-align: center;
  background: var(--bg-surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.empty-icon {
  margin-bottom: 16px;
  color: var(--text-tertiary);
}

.empty-text {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 12px;
  color: var(--text-tertiary);
}

.palette-strip-section {
  margin-top: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.save-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-default);
  background: transparent;
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  font-family: inherit;
  text-transform: none;
  letter-spacing: normal;
}

.save-btn:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-soft);
}

.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.empty-saved {
  font-size: 12px;
  color: var(--text-tertiary);
  padding: 8px 0;
}

.presets-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.saved-palette-card {
  position: relative;
  display: flex;
}

.delete-saved-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s;
  z-index: 1;
}

.saved-palette-card:hover .delete-saved-btn {
  opacity: 1;
}

.delete-saved-btn:hover {
  background: var(--error-soft);
  color: var(--error);
  border-color: var(--error);
}

.preset-btn {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  font-family: inherit;
  overflow: hidden;
  padding: 0;
}

.preset-btn:hover {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
  transform: translateY(-1px);
}

.preset-bars {
  display: flex;
  height: 36px;
  border-bottom: 1px solid var(--border-default);
}

.preset-bar {
  flex: 1;
}

.preset-name {
  font-size: 11px;
  color: var(--text-secondary);
  font-weight: 500;
  padding: 6px 10px 2px;
}

.preset-count {
  font-size: 10px;
  color: var(--text-tertiary);
  padding: 0 10px 8px;
}
</style>
