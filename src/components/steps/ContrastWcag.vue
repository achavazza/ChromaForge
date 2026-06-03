<template>
  <div class="step-root animate-fade-in">
    <div class="step-header">
      <div>
        <h1 class="step-title">Contrast & WCAG Testing</h1>
        <p class="step-subtitle">Exhaustive accessibility validation across all color pairs. Approve relevant pairings for your UI.</p>
      </div>
      <div class="summary-cards">
        <div class="summary-card aaa">
          <span class="summary-number">{{ palette.aaaCount }}</span>
          <span class="summary-label">AAA</span>
        </div>
        <div class="summary-card aa">
          <span class="summary-number">{{ palette.aaCount }}</span>
          <span class="summary-label">AA</span>
        </div>
        <div class="summary-card fail">
          <span class="summary-number">{{ palette.failCount }}</span>
          <span class="summary-label">Fail</span>
        </div>
      </div>
    </div>

    <!-- Generate button -->
    <div v-if="palette.contrastPairs.length === 0" class="generate-section">
      <div class="generate-card">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        <h3>Run Contrast Analysis</h3>
        <p>Test all {{ palette.colors.length * (palette.colors.length - 1) / 2 }} color pairs against WCAG standards</p>
        <button class="btn btn-primary btn-lg" @click="runAnalysis" id="run-contrast-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          Analyze Contrast
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Filters -->
      <div class="filter-bar">
        <div class="filter-tabs">
          <button
            v-for="f in filters"
            :key="f.key"
            class="filter-tab"
            :class="{ active: activeFilter === f.key }"
            @click="activeFilter = f.key"
          >
            {{ f.label }}
            <span class="filter-count">{{ f.count }}</span>
          </button>
        </div>
        <button class="btn btn-secondary btn-sm" @click="runAnalysis">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Re-run
        </button>
      </div>

      <!-- Pairs Table -->
      <div class="pairs-table-wrap">
        <table class="pairs-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Pairing</th>
              <th>Ratio</th>
              <th>AA</th>
              <th>AAA</th>
              <th>Large Text</th>
              <th>Relevant</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="pair in filteredPairs"
              :key="pair.id"
              class="pair-row"
              :class="{
                'row-approved': pair.approved,
                'row-ignored': pair.ignored
              }"
            >
              <td class="preview-cell">
                <div class="pair-preview">
                  <div class="preview-bg" :style="{ background: getColor(pair.backgroundId)?.hex }">
                    <span class="preview-text" :style="{ color: getColor(pair.foregroundId)?.hex }">Aa</span>
                  </div>
                  <div class="preview-bg" :style="{ background: getColor(pair.foregroundId)?.hex }">
                    <span class="preview-text" :style="{ color: getColor(pair.backgroundId)?.hex }">Aa</span>
                  </div>
                </div>
              </td>
              <td class="pairing-cell">
                <div class="pairing-info">
                  <div class="color-dot-row">
                    <div class="color-dot" :style="{ background: getColor(pair.foregroundId)?.hex }" />
                    <span class="color-name">{{ getColor(pair.foregroundId)?.name || getColor(pair.foregroundId)?.hex }}</span>
                  </div>
                  <div class="color-dot-row">
                    <div class="color-dot" :style="{ background: getColor(pair.backgroundId)?.hex }" />
                    <span class="color-name">{{ getColor(pair.backgroundId)?.name || getColor(pair.backgroundId)?.hex }}</span>
                  </div>
                </div>
              </td>
              <td>
                <span class="ratio-chip" :class="ratioClass(pair)">
                  {{ pair.ratio }}:1
                </span>
              </td>
              <td>
                <span class="wcag-badge" :class="pair.wcagAA ? 'pass' : 'fail'">
                  {{ pair.wcagAA ? '✓ Pass' : '✗ Fail' }}
                </span>
              </td>
              <td>
                <span class="wcag-badge" :class="pair.wcagAAA ? 'pass' : 'fail'">
                  {{ pair.wcagAAA ? '✓ Pass' : '✗ Fail' }}
                </span>
              </td>
              <td>
                <span class="wcag-badge" :class="pair.wcagAALarge ? 'pass' : 'fail'">
                  {{ pair.wcagAALarge ? '✓ Pass' : '✗ Fail' }}
                </span>
              </td>
              <td>
                <button
                  class="approve-btn"
                  :class="{ approved: pair.approved }"
                  @click="palette.toggleApproved(pair.id)"
                  :title="pair.approved ? 'Remove from relevant' : 'Mark as relevant'"
                >
                  <svg v-if="pair.approved" width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePaletteStore } from '../../stores/palette'
import type { ContrastPair } from '../../stores/palette'

const palette = usePaletteStore()
const activeFilter = ref<'all' | 'aaa' | 'aa' | 'fail' | 'approved'>('all')

function runAnalysis() {
  palette.generateContrastPairs()
}

onMounted(() => {
  if (palette.colors.length > 1) {
    runAnalysis()
  }
})

function getColor(id: string) {
  return palette.colorById.get(id)
}

function ratioClass(pair: ContrastPair) {
  if (pair.wcagAAA) return 'ratio-aaa'
  if (pair.wcagAA) return 'ratio-aa'
  if (pair.wcagAALarge) return 'ratio-large'
  return 'ratio-fail'
}

const filters = computed(() => [
  { key: 'all', label: 'All', count: palette.contrastPairs.length },
  { key: 'aaa', label: 'AAA', count: palette.contrastPairs.filter(p => p.wcagAAA).length },
  { key: 'aa', label: 'AA', count: palette.contrastPairs.filter(p => p.wcagAA && !p.wcagAAA).length },
  { key: 'fail', label: 'Fail', count: palette.contrastPairs.filter(p => !p.wcagAA).length },
  { key: 'approved', label: 'Relevant', count: palette.contrastPairs.filter(p => p.approved).length },
] as const)

const filteredPairs = computed(() => {
  const pairs = palette.contrastPairs
  switch (activeFilter.value) {
    case 'aaa': return pairs.filter(p => p.wcagAAA)
    case 'aa': return pairs.filter(p => p.wcagAA && !p.wcagAAA)
    case 'fail': return pairs.filter(p => !p.wcagAA)
    case 'approved': return pairs.filter(p => p.approved)
    default: return pairs
  }
})
</script>

<style scoped>
.step-root { max-width: 960px; margin: 0 auto; }

.step-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
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

.summary-cards {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-default);
  min-width: 60px;
}

.summary-card.aaa { background: var(--success-soft); border-color: rgba(16,185,129,0.2); }
.summary-card.aa { background: var(--info-soft); border-color: rgba(59,130,246,0.2); }
.summary-card.fail { background: var(--error-soft); border-color: rgba(239,68,68,0.2); }

.summary-number {
  font-size: 22px;
  font-weight: 800;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1;
}

.aaa .summary-number { color: var(--success); }
.aa .summary-number { color: var(--info); }
.fail .summary-number { color: var(--error); }

.summary-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 4px;
  color: var(--text-tertiary);
}

.generate-section {
  display: flex;
  justify-content: center;
  padding: 48px 24px;
}

.generate-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  background: var(--bg-surface);
  border: 1px dashed var(--border-strong);
  border-radius: var(--radius-lg);
  padding: 48px 40px;
  max-width: 400px;
  width: 100%;
}

.generate-card h3 { font-size: 16px; font-weight: 700; color: var(--text-primary); }
.generate-card p { font-size: 12px; color: var(--text-secondary); }

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.filter-tabs {
  display: flex;
  gap: 4px;
  background: var(--bg-subtle);
  border-radius: var(--radius-sm);
  padding: 3px;
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.15s;
  font-family: inherit;
}

.filter-tab:hover { background: var(--bg-surface); color: var(--text-primary); }
.filter-tab.active { background: var(--bg-surface); color: var(--text-primary); box-shadow: var(--shadow-sm); }

.filter-count {
  font-size: 10px;
  background: var(--bg-subtle);
  padding: 1px 5px;
  border-radius: 99px;
  color: var(--text-tertiary);
  font-weight: 600;
}

.filter-tab.active .filter-count {
  background: var(--accent-soft);
  color: var(--accent);
}

.pairs-table-wrap {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  overflow: hidden;
  overflow-x: auto;
}

.pairs-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.pairs-table thead { background: var(--bg-subtle); }

.pairs-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-tertiary);
  border-bottom: 1px solid var(--border-default);
  white-space: nowrap;
}

.pair-row {
  border-bottom: 1px solid var(--border-subtle);
  transition: background 0.1s;
}

.pair-row:last-child { border-bottom: none; }
.pair-row:hover { background: var(--bg-subtle); }
.pair-row.row-approved { background: var(--success-soft); }

.pairs-table td { padding: 10px 14px; vertical-align: middle; }

.pair-preview {
  display: flex;
  gap: 4px;
}

.preview-bg {
  width: 36px;
  height: 28px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}

.preview-text {
  font-size: 13px;
  font-weight: 700;
  line-height: 1;
}

.pairing-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.color-dot-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.color-name {
  font-size: 11px;
  color: var(--text-secondary);
  white-space: nowrap;
}

.ratio-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  white-space: nowrap;
}

.ratio-aaa { background: var(--success-soft); color: var(--success); }
.ratio-aa { background: var(--info-soft); color: var(--info); }
.ratio-large { background: var(--warning-soft); color: var(--warning); }
.ratio-fail { background: var(--error-soft); color: var(--error); }

.wcag-badge {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 4px;
  white-space: nowrap;
}

.wcag-badge.pass { background: var(--success-soft); color: var(--success); }
.wcag-badge.fail { background: var(--error-soft); color: var(--error); }

.approve-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.approve-btn:hover { color: var(--success); background: var(--success-soft); }
.approve-btn.approved { color: var(--success); }
</style>
