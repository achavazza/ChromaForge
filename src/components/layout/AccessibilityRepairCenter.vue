<template>
  <div class="arc-root">
    <!-- Section 1: Accessibility Score -->
    <div class="arc-panel">
      <div class="arc-score-head">
        <span class="arc-score-label">Accessibility Score</span>
        <span class="arc-score-val" :style="{ color: scoreColor }">{{ score }}</span>
      </div>
      <div class="health-bar-track">
        <div class="health-bar-fill" :style="{ width: score + '%', background: scoreColor }" />
      </div>
    </div>

    <!-- Section 2: Problems Found -->
    <div class="arc-panel">
      <div class="arc-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="arc-header-title">Problems Found</span>
      </div>
      <div class="arc-problems">
        <div class="arc-problem" v-if="contrastFails > 0">
          <span class="arc-problem-icon fail">!</span>
          <span class="arc-problem-text">{{ contrastFails }} Contrast Failure{{ contrastFails > 1 ? 's' : '' }}</span>
        </div>
        <div class="arc-problem" v-if="cbConflicts > 0">
          <span class="arc-problem-icon warn">●</span>
          <span class="arc-problem-text">{{ cbConflicts }} Color Blind Conflict{{ cbConflicts > 1 ? 's' : '' }}</span>
        </div>
        <div class="arc-problem" v-if="extremePairs > 0">
          <span class="arc-problem-icon info">i</span>
          <span class="arc-problem-text">{{ extremePairs }} Extreme Contrast Pair{{ extremePairs > 1 ? 's' : '' }}</span>
        </div>
        <div v-if="contrastFails === 0 && cbConflicts === 0 && extremePairs === 0" class="arc-none">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>No accessibility issues detected</span>
        </div>
      </div>
    </div>

    <!-- Section 3: Suggested Repairs -->
    <div class="arc-panel">
      <div class="arc-header">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20V10M18 20V4M6 20v-4"/>
        </svg>
        <span class="arc-header-title">Suggested Repairs</span>
      </div>

      <!-- Contrast Repairs -->
      <div v-for="cr in contrastRepairs" :key="`cr-${cr.foregroundId}-${cr.backgroundId}`" class="arc-repair-block">
        <div class="arc-repair-type">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          Contrast Failure
        </div>
        <div class="arc-current-pair">
          <div class="arc-pair-side">
            <span class="arc-pair-label">Text</span>
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: cr.currentFg }" />
              <code class="arc-hex">{{ cr.currentFg }}</code>
            </span>
          </div>
          <div class="arc-pair-side">
            <span class="arc-pair-label">Background</span>
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: cr.currentBg }" />
              <code class="arc-hex">{{ cr.currentBg }}</code>
            </span>
          </div>
          <div class="arc-ratio-badge fail">{{ cr.currentRatio }}:1</div>
        </div>

        <div
          v-for="rp in cr.repairs"
          :key="rp.variant"
          class="arc-repair-card"
          :class="{ chosen: cr.chosenVariant === rp.variant }"
        >
          <div class="arc-repair-variant">
            <span class="arc-variant-label">Repair {{ rp.variant.toUpperCase() }}</span>
            <span class="arc-variant-desc">{{ rp.label }}</span>
          </div>
          <div class="arc-suggested-pair">
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: rp.fg }" />
              <code class="arc-hex">{{ rp.fg }}</code>
            </span>
            <span class="arc-on">on</span>
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: rp.bg }" />
              <code class="arc-hex">{{ rp.bg }}</code>
            </span>
            <div class="arc-ratio-badge pass">{{ rp.ratio }}:1</div>
          </div>
          <div class="arc-benefits">
            <span class="arc-benefit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Passes WCAG AA
            </span>
            <span class="arc-benefit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ΔE {{ rp.deltaE }} from original
            </span>
          </div>
          <div class="arc-repair-actions">
            <button class="arc-btn arc-btn-sm" @click="previewRepair(cr, rp)" title="Preview this repair">Preview</button>
            <button class="arc-btn arc-btn-sm arc-btn-primary" @click="applyRepair(cr, rp)">Apply</button>
            <button class="arc-btn arc-btn-sm" @click="shuffleRepair(cr)" title="Cycle variants">Shuffle</button>
          </div>
        </div>
      </div>

      <!-- Color Blind Repairs -->
      <div v-for="cbr in cbRepairs" :key="`cb-${cbr.typeName}-${cbr.colorId}-${cbr.partnerColorId}`" class="arc-repair-block">
        <div class="arc-repair-type">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
          </svg>
          {{ cbr.typeName }} Conflict
        </div>
        <div class="arc-current-pair">
          <div class="arc-pair-side">
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: cbr.currentHex }" />
              <code class="arc-hex">{{ cbr.currentHex }}</code>
            </span>
          </div>
          <div class="arc-pair-side">
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: cbr.partnerHex }" />
              <code class="arc-hex">{{ cbr.partnerHex }}</code>
            </span>
          </div>
          <div class="arc-ratio-badge warn">ΔE {{ cbr.simDelta }}</div>
        </div>

        <div
          v-for="alt in cbr.alternatives"
          :key="alt.variant"
          class="arc-repair-card"
          :class="{ chosen: cbr.chosenVariant === alt.variant }"
        >
          <div class="arc-repair-variant">
            <span class="arc-variant-label">Repair {{ alt.variant.toUpperCase() }}</span>
            <span class="arc-variant-desc">{{ alt.label }}</span>
          </div>
          <div class="arc-suggested-pair">
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: alt.hex }" />
              <code class="arc-hex">{{ alt.hex }}</code>
            </span>
            <span class="arc-on">vs</span>
            <span class="arc-swatch-row">
              <span class="arc-swatch" :style="{ background: cbr.partnerHex }" />
              <code class="arc-hex">{{ cbr.partnerHex }}</code>
            </span>
            <div class="arc-ratio-badge pass">ΔE {{ alt.simDeltaE }}</div>
          </div>
          <div class="arc-benefits">
            <span class="arc-benefit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              ΔE {{ alt.deltaE }} shift
            </span>
            <span class="arc-benefit">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              +{{ alt.simDeltaE - cbr.simDelta }} distinction
            </span>
          </div>
          <div class="arc-repair-actions">
            <button class="arc-btn arc-btn-sm" @click="previewCBRepair(cbr, alt)">Preview</button>
            <button class="arc-btn arc-btn-sm arc-btn-primary" @click="applyCBRepair(cbr, alt)">Apply</button>
            <button class="arc-btn arc-btn-sm" @click="shuffleCBRepair(cbr)">Shuffle</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Accessibility Improvement Score -->
    <div v-if="improvement > 0" class="arc-panel arc-improve">
      <div class="arc-improve-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
          <polyline points="17 6 23 6 23 12"/>
        </svg>
        <span>Accessibility Improvement Score</span>
      </div>
      <div class="arc-improve-body">
        <div class="arc-improve-before">
          <span class="arc-improve-label">Before</span>
          <span class="arc-improve-val" :style="{ color: scoreColor }">{{ score }}</span>
        </div>
        <svg class="arc-improve-arrow" width="20" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="16 2 22 6 16 10"/><line x1="2" y1="6" x2="22" y2="6"/>
        </svg>
        <div class="arc-improve-after">
          <span class="arc-improve-label">After</span>
          <span class="arc-improve-val" style="color: var(--success);">{{ score + improvement }}</span>
        </div>
        <span class="arc-improve-diff">+{{ improvement }} points</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../stores/palette'
import { useWorkspaceStore } from '../../stores/workspace'
import { computeContrastRepairs, computeCBConflicts } from '../../composables/useAccessibilityRepair'
import type { ContrastRepair, CBConflictRepair, ContrastRepairVariant, CBConflictAlternative } from '../../composables/useAccessibilityRepair'

const palette = usePaletteStore()
const workspace = useWorkspaceStore()

const contrastRepairs = ref<ContrastRepair[]>([])
const cbRepairs = ref<CBConflictRepair[]>([])

function computeAll() {
  contrastRepairs.value = computeContrastRepairs(palette.contrastPairs, palette.colors)
  cbRepairs.value = computeCBConflicts(palette.colors)
}

computeAll()

const contrastFails = computed(() => contrastRepairs.value.length)
const cbConflicts = computed(() => cbRepairs.value.length)
const extremePairs = computed(() => {
  let count = 0
  for (const p of palette.contrastPairs) {
    if (!p.ignored && p.ratio > 18) count++
  }
  return count
})

const score = computed(() => {
  const c = contrastFails.value
  const cb = cbConflicts.value
  const ext = extremePairs.value
  return Math.max(10, 100 - c * 10 - cb * 7 - ext * 3)
})

const scoreColor = computed(() => {
  const s = score.value
  if (s >= 80) return 'var(--success)'
  if (s >= 50) return 'var(--warning)'
  return 'var(--error)'
})

const improvement = computed(() => {
  const applied = contrastRepairs.value.filter(r => r.chosenVariant).length
  const appCB = cbRepairs.value.filter(r => r.chosenVariant).length
  return applied * 10 + appCB * 7
})

function previewRepair(_cr: ContrastRepair, _rp: ContrastRepairVariant) {
}

function applyRepair(cr: ContrastRepair, rp: ContrastRepairVariant) {
  palette.updateColor(cr.foregroundId, { hex: rp.fg })
  palette.generateContrastPairs()
  cr.chosenVariant = rp.variant
  setTimeout(() => computeAll(), 50)
}

function shuffleRepair(cr: ContrastRepair) {
  const idx = cr.repairs.findIndex(r => r.variant === (cr.chosenVariant || cr.repairs[0].variant))
  const next = (idx + 1) % cr.repairs.length
  cr.chosenVariant = cr.repairs[next].variant
}

function previewCBRepair(_cbr: CBConflictRepair, _alt: CBConflictAlternative) {
}

function applyCBRepair(cbr: CBConflictRepair, alt: CBConflictAlternative) {
  palette.updateColor(cbr.colorId, { hex: alt.hex })
  palette.generateContrastPairs()
  cbr.chosenVariant = alt.variant
  setTimeout(() => computeAll(), 50)
}

function shuffleCBRepair(cbr: CBConflictRepair) {
  const idx = cbr.alternatives.findIndex(a => a.variant === (cbr.chosenVariant || cbr.alternatives[0].variant))
  const next = (idx + 1) % cbr.alternatives.length
  cbr.chosenVariant = cbr.alternatives[next].variant
}
</script>

<style scoped>
.arc-root {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}
.arc-panel {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 12px;
}
.arc-score-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.arc-score-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
}
.arc-score-val {
  font-size: 28px;
  font-weight: 800;
  line-height: 1;
}
.health-bar-track {
  height: 5px;
  background: var(--bg-subtle);
  border-radius: 999px;
  overflow: hidden;
}
.health-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.4s ease;
}
.arc-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: var(--text-secondary);
}
.arc-header-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.arc-problems {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.arc-problem {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}
.arc-problem-icon {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
  flex-shrink: 0;
}
.arc-problem-icon.fail { background: color-mix(in srgb, var(--error) 18%, transparent); color: var(--error); }
.arc-problem-icon.warn { background: color-mix(in srgb, var(--warning) 18%, transparent); color: var(--warning); }
.arc-problem-icon.info { background: color-mix(in srgb, var(--accent) 18%, transparent); color: var(--accent); }
.arc-none {
  font-size: 12px;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 5px;
}
.arc-repair-block {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 8px;
}
.arc-repair-type {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--error);
  margin-bottom: 8px;
}
.arc-current-pair {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.arc-pair-side {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.arc-pair-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 500;
}
.arc-swatch-row {
  display: flex;
  align-items: center;
  gap: 4px;
}
.arc-swatch {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1px solid var(--border-default);
  flex-shrink: 0;
}
.arc-hex {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: var(--text-secondary);
}
.arc-on {
  font-size: 9px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
}
.arc-ratio-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}
.arc-ratio-badge.fail { background: color-mix(in srgb, var(--error) 15%, transparent); color: var(--error); }
.arc-ratio-badge.pass { background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); }
.arc-ratio-badge.warn { background: color-mix(in srgb, var(--warning) 15%, transparent); color: var(--warning); }
.arc-repair-card {
  border: 1px solid var(--border-default);
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 6px;
  background: var(--bg-subtle);
}
.arc-repair-card.chosen {
  border-color: var(--success);
  background: color-mix(in srgb, var(--success) 5%, var(--bg-surface));
}
.arc-repair-variant {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
.arc-variant-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-primary);
}
.arc-variant-desc {
  font-size: 10px;
  color: var(--text-tertiary);
}
.arc-suggested-pair {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.arc-benefits {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}
.arc-benefit {
  font-size: 10px;
  color: var(--success);
  display: flex;
  align-items: center;
  gap: 3px;
}
.arc-repair-actions {
  display: flex;
  gap: 4px;
}
.arc-btn {
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-default);
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.12s;
}
.arc-btn:hover { background: var(--bg-elevated); color: var(--text-primary); }
.arc-btn-primary {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.arc-btn-primary:hover { filter: brightness(1.15); }
.arc-improve-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--success);
  margin-bottom: 10px;
}
.arc-improve-body {
  display: flex;
  align-items: center;
  gap: 10px;
}
.arc-improve-before, .arc-improve-after {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.arc-improve-label {
  font-size: 10px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  font-weight: 600;
}
.arc-improve-val {
  font-size: 22px;
  font-weight: 800;
}
.arc-improve-diff {
  font-size: 13px;
  font-weight: 700;
  color: var(--success);
  flex-shrink: 0;
}
.arc-improve-arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
}
</style>
