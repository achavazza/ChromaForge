<template>
  <div class="step-root animate-fade-in">
    <div class="step-header">
      <div>
        <h1 class="step-title">Live Preview & Export</h1>
        <p class="step-subtitle">{{ subtitle }}</p>
      </div>
      <div class="export-actions">
        <select class="role-select export-format-select" v-model="exportFormat" id="export-format-select">
          <option value="css">CSS Variables</option>
          <option value="scss">SCSS Variables</option>
          <option value="json">JSON Tokens</option>
          <option value="tailwind">Tailwind Config</option>
          <option value="figma">Figma Tokens</option>
        </select>
        <button class="btn btn-secondary" @click="copyExport" id="copy-export-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          {{ copied ? 'Copied!' : 'Copy' }}
        </button>
        <button class="btn btn-primary" @click="downloadExport" id="download-export-btn">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download
        </button>
      </div>
    </div>

    <!-- Before/After Slider (UI Design only) -->
    <div v-if="workspace.id === 'ui-design'" class="section-block">
      <div class="section-label">Before / After Comparison</div>
      <div class="split-container" ref="splitRef" @mousemove="onSliderMove" @mouseup="stopSlider" @mouseleave="stopSlider">
        <div class="split-before" :style="{ clipPath: `inset(0 ${100 - splitPos}% 0 0)` }">
          <WorkspacePreview :colors="palette.originalColors" label="Original" />
        </div>
        <div class="split-after">
          <WorkspacePreview :colors="palette.colors" label="Refined" />
        </div>
        <div
          class="split-handle"
          :style="{ left: splitPos + '%' }"
          @mousedown.prevent="startSlider"
        >
          <div class="split-handle-bar" />
          <div class="split-handle-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6"/><polyline points="9 18 3 12 9 6"/>
            </svg>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="transform: scaleX(-1)">
              <polyline points="15 18 9 12 15 6"/><polyline points="9 18 3 12 9 6"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Workspace Preview -->
    <div class="section-block">
      <div class="section-label">{{ previewLabel }}</div>
      <WorkspacePreview :colors="palette.colors" :full="true" />
    </div>

    <!-- Export Code -->
    <div class="section-block">
      <div class="section-label">Export Code</div>
      <div class="export-panel">
        <div class="export-header">
          <div class="format-tabs">
            <button
              v-for="fmt in formatOptions"
              :key="fmt.value"
              class="format-tab"
              :class="{ active: exportFormat === fmt.value }"
              @click="exportFormat = fmt.value as any"
            >{{ fmt.label }}</button>
          </div>
        </div>
        <pre class="export-code"><code>{{ exportCode }}</code></pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { usePaletteStore } from '../../stores/palette'
import { useWorkspaceStore } from '../../stores/workspace'
import { useExport } from '../../composables/useExport'
import type { ExportFormat } from '../../composables/useExport'
import WorkspacePreview from '../ui/previews/WorkspacePreview.vue'

const palette = usePaletteStore()
const workspace = useWorkspaceStore()
const { generate, download, copyToClipboard, formatExtensions } = useExport()

const ws = computed(() => workspace.definition)

const previewLabel = computed(() => {
  if (!ws.value) return 'Live Preview'
  const labels: Record<string, string> = {
    'ui-design': 'UI Component Preview',
    'data-viz': 'Chart & Visualization Preview',
    'accessibility': 'Accessibility Report Preview',
    'branding': 'Brand & Marketing Preview',
  }
  return labels[ws.value.id] || 'Live Preview'
})

const subtitle = computed(() => {
  if (!ws.value) return 'See your color palette in action.'
  const subs: Record<string, string> = {
    'ui-design': 'See your palette in action across real UI patterns, then export to your preferred format.',
    'data-viz': 'Preview your palette as charts and data visualizations, then export as design tokens.',
    'accessibility': 'Review accessibility simulations and contrast reports, then export your token set.',
    'branding': 'Preview your palette across brand mockups and marketing materials, then export your tokens.',
  }
  return subs[ws.value.id] || 'Preview your palette and export to your preferred format.'
})

const exportFormat = ref<ExportFormat>('css')
const copied = ref(false)
const splitPos = ref(50)
const isDragging = ref(false)
const splitRef = ref<HTMLElement>()

const formatOptions = [
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'tailwind', label: 'Tailwind' },
  { value: 'figma', label: 'Figma' },
]

const exportCode = computed(() => generate(palette.colors, exportFormat.value))

async function copyExport() {
  await copyToClipboard(exportCode.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function downloadExport() {
  download(exportCode.value, formatExtensions[exportFormat.value])
}

function startSlider() { isDragging.value = true }
function stopSlider() { isDragging.value = false }
function onSliderMove(e: MouseEvent) {
  if (!isDragging.value || !splitRef.value) return
  const rect = splitRef.value.getBoundingClientRect()
  const pos = ((e.clientX - rect.left) / rect.width) * 100
  splitPos.value = Math.max(5, Math.min(95, pos))
}
</script>

<style scoped>
.step-root { max-width: 960px; margin: 0 auto; }

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
  margin-bottom: 6px;
}

.step-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  max-width: 480px;
  line-height: 1.6;
}

.export-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

.export-format-select {
  width: auto;
  min-width: 140px;
}

.section-block {
  margin-bottom: 24px;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.split-container {
  position: relative;
  height: 480px;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--border-default);
  user-select: none;
  cursor: col-resize;
}

.split-before {
  position: absolute;
  inset: 0;
  z-index: 2;
  overflow: hidden;
}

.split-after {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.split-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background: white;
  z-index: 10;
  transform: translateX(-50%);
  box-shadow: 0 0 0 1px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.3);
}

.split-handle-bar {
  position: absolute;
  inset: 0;
  background: white;
}

.split-handle-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 36px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  color: #374151;
  cursor: col-resize;
}

.export-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  overflow: hidden;
}

.export-header {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-subtle);
}

.format-tabs {
  display: flex;
  gap: 2px;
}

.format-tab {
  padding: 5px 12px;
  border-radius: 5px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  font-family: inherit;
  transition: all 0.15s;
}

.format-tab:hover { background: var(--bg-surface); color: var(--text-primary); }
.format-tab.active { background: var(--bg-surface); color: var(--accent); font-weight: 600; box-shadow: var(--shadow-sm); }

.export-code {
  padding: 20px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--text-primary);
  background: var(--bg-base);
  overflow-x: auto;
  max-height: 360px;
  overflow-y: auto;
  line-height: 1.7;
  white-space: pre;
}
</style>
