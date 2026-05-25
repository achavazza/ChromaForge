<template>
  <div class="step-root animate-fade-in">
    <div class="step-header">
      <div>
        <h1 class="step-title">Analysis & Smart Suggestions</h1>
        <p class="step-subtitle">Palette health analysis with actionable insights and intelligent color suggestions.</p>
      </div>
      <div class="health-badge" :style="{ '--score-color': healthColor }">
        <svg width="36" height="36" viewBox="0 0 36 36" class="health-ring">
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border-default)" stroke-width="3"/>
          <circle
            cx="18" cy="18" r="14" fill="none"
            :stroke="healthColor" stroke-width="3"
            stroke-linecap="round"
            :stroke-dasharray="`${2 * Math.PI * 14}`"
            :stroke-dashoffset="`${2 * Math.PI * 14 * (1 - healthScore / 100)}`"
            transform="rotate(-90 18 18)"
            style="transition: stroke-dashoffset 0.5s ease"
          />
        </svg>
        <div class="health-info">
          <span class="health-number" :style="{ color: healthColor }">{{ healthScore }}</span>
          <span class="health-label">Health</span>
        </div>
      </div>
    </div>

    <div class="analysis-grid">
      <!-- Issues Panel -->
      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Palette Issues
          </h2>
          <span class="issue-count" :class="{ 'has-critical': criticalCount > 0 }">
            {{ issues.length }} issue{{ issues.length !== 1 ? 's' : '' }}
          </span>
        </div>

        <div v-if="issues.length === 0" class="all-good">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <p>All checks passed!</p>
          <p class="all-good-sub">Your palette looks healthy.</p>
        </div>

        <div v-else class="issues-list">
          <div
            v-for="issue in issues"
            :key="issue.id"
            class="issue-card"
            :class="`severity-${issue.severity}`"
          >
            <div class="issue-header">
              <div class="severity-dot" />
              <span class="issue-title">{{ issue.title }}</span>
              <span class="severity-badge">{{ issue.severity }}</span>
            </div>
            <p class="issue-desc">{{ issue.description }}</p>
            <div class="issue-suggestion">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
              {{ issue.suggestion }}
            </div>
          </div>
        </div>
      </section>

      <!-- Suggestions Panel -->
      <section class="panel">
        <div class="panel-header">
          <h2 class="panel-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Smart Suggestions
          </h2>
          <span class="suggestion-count">{{ suggestions.length }} suggestions</span>
        </div>

        <div v-if="suggestions.length === 0" class="all-good">
          <p>No suggestions needed!</p>
          <p class="all-good-sub">Your palette is complete.</p>
        </div>

        <div v-else class="suggestions-list">
          <SuggestionCard
            v-for="suggestion in suggestions"
            :key="suggestion.id"
            :suggestion="suggestion"
            @add="addSuggestion(suggestion)"
            @shuffle="shuffleSuggestion(suggestion)"
          />
        </div>
      </section>
    </div>


    <!-- Tonal scales section -->
    <div class="tonal-section">
      <div class="section-label">Tonal Scales</div>
      <div class="tonal-grid">
        <div v-for="color in palette.colors" :key="color.id" class="tonal-row">
          <span class="tonal-name">{{ color.name || color.hex }}</span>
          <div class="tonal-swatches">
            <div
              v-for="(shade, i) in tonalScale(color.hex).scale"
              :key="i"
              class="tonal-swatch"
              :class="{ active: i === tonalScale(color.hex).activeIndex }"
              :style="{ background: shade }"
              :title="shade"
              @click="i === tonalScale(color.hex).activeIndex ? openTonalPicker(color.id) : null"
            >
              <div v-if="i === tonalScale(color.hex).activeIndex" class="tonal-center-marker">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tonal edit modal -->
    <Teleport to="body">
      <div v-if="editModalColor" class="modal-overlay" @click="editModalColor = null">
        <div class="color-modal" @click.stop>
          <button class="modal-close-btn" @click="editModalColor = null">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/>
            </svg>
          </button>
          <div class="modal-swatch-area" :style="{ background: editModalColor.hex }">
            <div class="modal-swatch-hex">{{ editModalColor.hex }}</div>
          </div>
          <div class="modal-body">
            <div class="modal-info-grid">
              <div class="modal-info-item">
                <span class="modal-info-label">HEX</span>
                <span class="modal-info-value">{{ editModalColor.hex }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(editModalColor.hex)" title="Copy HEX">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">RGB</span>
                <span class="modal-info-value-rgb">{{ getRGB(editModalColor.hex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getRGB(editModalColor.hex))" title="Copy RGB">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span class="copy-label">Copy</span>
                </button>
              </div>
              <div class="modal-info-item">
                <span class="modal-info-label">HSL</span>
                <span class="modal-info-value-rgb">{{ getHSL(editModalColor.hex) }}</span>
                <button class="btn btn-ghost btn-icon-xs modal-copy-btn" @click="copy(getHSL(editModalColor.hex))" title="Copy HSL">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  <span class="copy-label">Copy</span>
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
                  <input type="color" :value="editModalColor.hex" @input="(e) => updateEditHex((e.target as HTMLInputElement).value.toUpperCase())" class="color-picker-input" />
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit
                </label>
              </div>
              <div class="modal-actions-row">
                <button class="btn btn-secondary modal-action-btn" @click="cloneEditColor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Clone
                </button>
                <button class="btn btn-danger modal-action-btn" @click="removeEditColor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
                  Remove
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
import { computed, ref, onMounted } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import type { ColorEntry } from '../../stores/palette'
import { usePaletteAnalysis } from '../../composables/usePaletteAnalysis'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'
import SuggestionCard from '../ui/SuggestionCard.vue'
import type { Suggestion } from '../../composables/usePaletteAnalysis'

const palette = usePaletteStore()
const themeStore = useThemeStore()
const { issues, suggestions, healthScore, regenerateSuggestion } = usePaletteAnalysis(() => palette.colors, () => themeStore.isDark)

const healthColor = computed(() => {
  if (healthScore.value >= 80) return 'var(--success)'
  if (healthScore.value >= 60) return 'var(--warning)'
  return 'var(--error)'
})

const criticalCount = computed(() => issues.value.filter(i => i.severity === 'critical').length)

function addSuggestion(s: Suggestion) {
  palette.addColor(s.hex)
  const c = palette.colors[palette.colors.length - 1]
  palette.updateColor(c.id, { roles: [s.role as any], name: s.title.replace('Add ', '').replace('a ', '').replace('an ', '') })
}

function shuffleSuggestion(s: Suggestion) {
  regenerateSuggestion(s.id)
}

// Tonal scale modal
const editModalColor = ref<ColorEntry | null>(null)
const hasEyeDropper = ref(false)

onMounted(() => {
  hasEyeDropper.value = 'EyeDropper' in window
})

function tonalScale(hex: string) { return generateTonalScaleOKLCH(hex, 9) }

function openTonalPicker(colorId: string) {
  const color = palette.colors.find(c => c.id === colorId)
  if (color) editModalColor.value = { ...color }
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

function updateEditHex(hex: string) {
  if (!editModalColor.value) return
  editModalColor.value = { ...editModalColor.value, hex: hex.toUpperCase() }
}

function cloneEditColor() {
  if (!editModalColor.value) return
  palette.duplicateColor(editModalColor.value.id)
  editModalColor.value = null
}

function removeEditColor() {
  if (!editModalColor.value) return
  palette.removeColor(editModalColor.value.id)
  editModalColor.value = null
}

async function pickEditColor() {
  if (!('EyeDropper' in window) || !editModalColor.value) return
  try {
    // @ts-ignore
    const eyeDropper = new window.EyeDropper()
    const result = await eyeDropper.open()
    updateEditHex(result.sRGBHex)
    const color = palette.colors.find(c => c.id === editModalColor.value!.id)
    if (color) palette.updateColor(color.id, { hex: result.sRGBHex.toUpperCase() })
  } catch { /* ignore */ }
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

.health-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 12px 16px;
  flex-shrink: 0;
}

.health-ring { flex-shrink: 0; }

.health-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}

.health-number {
  font-size: 20px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.health-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.analysis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 28px;
}

@media (max-width: 700px) {
  .analysis-grid { grid-template-columns: 1fr; }
}

.panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-default);
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.issue-count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-subtle);
  color: var(--text-secondary);
  font-weight: 600;
}

.issue-count.has-critical {
  background: var(--error-soft);
  color: var(--error);
}

.suggestion-count {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 600;
}

.all-good {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  text-align: center;
  color: var(--success);
  gap: 8px;
}

.all-good p { font-size: 14px; font-weight: 600; }
.all-good-sub { font-size: 12px; color: var(--text-tertiary); }

.issues-list, .suggestions-list {
  display: flex;
  flex-direction: column;
  padding: 12px;
  gap: 8px;
  max-height: 420px;
  overflow-y: auto;
}

.issue-card {
  padding: 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
}

.severity-critical {
  background: var(--error-soft);
  border-color: rgba(239,68,68,0.2);
}

.severity-warning {
  background: var(--warning-soft);
  border-color: rgba(245,158,11,0.2);
}

.severity-info {
  background: var(--info-soft);
  border-color: rgba(59,130,246,0.2);
}

.issue-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.severity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.severity-critical .severity-dot { background: var(--error); }
.severity-warning .severity-dot { background: var(--warning); }
.severity-info .severity-dot { background: var(--info); }

.issue-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
}

.severity-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1px 6px;
  border-radius: 4px;
}

.severity-critical .severity-badge { background: var(--error); color: white; }
.severity-warning .severity-badge { background: var(--warning); color: white; }
.severity-info .severity-badge { background: var(--info); color: white; }

.issue-desc {
  font-size: 11.5px;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 6px;
}

.issue-suggestion {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-size: 11px;
  color: var(--text-tertiary);
  font-style: italic;
  line-height: 1.5;
}

/* Tonal scales */
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

/* Edit modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.color-modal {
  background: var(--bg-surface);
  border-radius: 16px;
  width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  position: relative;
}

.modal-close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background: rgba(0,0,0,0.25);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  transition: background 0.15s;
}

.modal-close-btn:hover {
  background: rgba(0,0,0,0.45);
}

.modal-swatch-area {
  height: 120px;
  border-radius: 16px 16px 0 0;
  display: flex;
  align-items: flex-end;
  padding: 12px 16px;
}

.modal-swatch-hex {
  font-size: 18px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  color: white;
  text-shadow: 0 1px 4px rgba(0,0,0,0.3);
}

.modal-body {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
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
}

.color-picker-label {
  display: flex !important;
  align-items: center;
  justify-content: center;
  gap: 5px;
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
