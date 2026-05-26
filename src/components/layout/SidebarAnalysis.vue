<template>
  <aside class="right-sidebar">
    <div class="rs-scroll">
      <!-- Palette Health -->
      <div class="rs-panel">
        <div class="rs-header">
          <span class="rs-title">Palette Health</span>
          <span class="health-score" :style="{ color: healthColor }" title="Calculated from palette issues only: -20 per critical issue, -10 per warning, -3 per info. Independent of composite scores above.">{{ healthScore }}%</span>
        </div>
        <div class="rs-body">
          <div class="health-bar-track">
            <div class="health-bar-fill" :style="{ width: healthScore + '%', background: healthColor }" />
          </div>
        </div>
      </div>

      <!-- Composite Scores -->
      <div class="rs-panel">
        <div class="rs-header">
          <span class="rs-title">Composite Scores</span>
        </div>
        <div class="rs-body">
          <div class="rs-scores">
            <div class="rs-score-row">
              <span class="rs-score-label" title="Can this palette actually be used in UI? Checks for essential roles (background, text, primary), neutral tones, and sufficient luminance range.">UI Practicality</span>
              <div class="rs-score-bar-track" :style="{ background: `color-mix(in srgb, ${scoreColor(scores.practicality)} 18%, transparent)` }">
                <div class="rs-score-bar-fill practicality" :style="{ width: scores.practicality + '%' , background: scoreColor(scores.practicality) }" />
              </div>
              <span class="rs-score-value" :style="{ color: scoreColor(scores.practicality) }">{{ scores.practicality }}</span>
            </div>
            <div class="rs-score-row">
              <span class="rs-score-label" title="How well do the colors work together? Measures average DeltaE distance and saturation variance — values too close or too far apart reduce cohesion.">Cohesion</span>
              <div class="rs-score-bar-track" :style="{ background: `color-mix(in srgb, ${scoreColor(scores.cohesion)} 18%, transparent)` }">
                <div class="rs-score-bar-fill cohesion" :style="{ width: scores.cohesion + '%', background: scoreColor(scores.cohesion) }" />
              </div>
              <span class="rs-score-value" :style="{ color: scoreColor(scores.cohesion) }">{{ scores.cohesion }}</span>
            </div>
            <div class="rs-score-row">
              <span class="rs-score-label" title="Will this palette cause eye strain? Penalizes highly saturated colors, extreme luminance ranges (pure black/white), and extreme contrast ratios (>12:1 or <2:1) in approved pairings.">Fatigue Resist.</span>
              <div class="rs-score-bar-track" :style="{ background: `color-mix(in srgb, ${scoreColor(scores.fatigue)} 18%, transparent)` }">
                <div class="rs-score-bar-fill fatigue" :style="{ width: scores.fatigue + '%', background: scoreColor(scores.fatigue) }" />
              </div>
              <span class="rs-score-value" :style="{ color: scoreColor(scores.fatigue) }">{{ scores.fatigue }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Categorized Insights -->
      <div v-for="group in insightGroups" :key="group.label" class="rs-panel" :class="{ collapsed: !openPanels[group.label] }">
        <button class="rs-header" @click="toggle(group.label)">
          <span class="rs-title">{{ group.label }}</span>
          <span class="rs-header-right">
            <span v-if="group.insights.length" class="rs-badge" :class="{ critical: group.insights.some(i => i.severity === 'critical') }">
              {{ group.insights.length }}
            </span>
            <svg class="rs-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </button>
        <div class="rs-body">
          <div v-for="insight in group.insights" :key="insight.id" class="rs-insight" :class="`sev-${insight.severity}`">
            <div class="rs-insight-top">
              <span class="rs-insight-sev-dot" />
              <span class="rs-insight-title">{{ insight.title }}</span>
            </div>
            <p class="rs-insight-desc">{{ insight.description }}</p>
          </div>
        </div>
      </div>

      <!-- Issues -->
      <div class="rs-panel" :class="{ collapsed: !openPanels.issues }">
        <button class="rs-header" @click="toggle('issues')">
          <span class="rs-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            Issues
          </span>
          <span class="rs-header-right">
            <span class="rs-badge" :class="{ critical: criticalCount > 0 }">{{ issues.length }}</span>
            <svg class="rs-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </button>
        <div class="rs-body">
          <div v-if="issues.length === 0" class="rs-empty">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <span>All checks passed</span>
          </div>
          <div v-else class="rs-list">
            <div v-for="issue in issues" :key="issue.id" class="rs-issue" :class="`severity-${issue.severity}`">
              <div class="rs-issue-top">
                <span class="rs-issue-title">{{ issue.title }}</span>
                <span class="rs-issue-sev">{{ issue.severity === 'critical' ? '!' : '•' }}</span>
              </div>
              <p class="rs-issue-desc">{{ issue.description }}</p>
            </div>
            <!-- <button v-if="issues.length > maxVisibleIssues" class="rs-more-btn" @click="showAllIssues = !showAllIssues">
              {{ showAllIssues ? 'Show less' : `+${issues.length - maxVisibleIssues} more` }}
            </button> -->
          </div>
        </div>
      </div>

      <!-- Refinements -->
      <div class="rs-panel" :class="{ collapsed: !openPanels.refinements }">
        <button class="rs-header" @click="toggle('refinements')">
          <span class="rs-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3h.01M12 7h.01M12 11h.01M12 15h.01M12 19h.01"/>
              <circle cx="12" cy="3" r="1" fill="currentColor"/>
              <circle cx="12" cy="7" r="1" fill="currentColor"/>
              <circle cx="12" cy="11" r="1" fill="currentColor"/>
              <circle cx="12" cy="15" r="1" fill="currentColor"/>
              <circle cx="12" cy="19" r="1" fill="currentColor"/>
            </svg>
            Refinements
          </span>
          <span class="rs-header-right">
            <span class="rs-badge accent">{{ refinements.length }}</span>
            <svg class="rs-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </button>
        <div class="rs-body">
          <div v-if="refinements.length === 0" class="rs-empty">
            <span>All colors well-balanced</span>
          </div>
          <div v-else class="rs-list">
            <div v-for="r in refinements" :key="r.colorId" class="rs-refinement">
              <div class="rs-ref-title">{{ r.title }}</div>
              <p class="rs-ref-explain">{{ r.explanation }}</p>
              <div class="rs-ref-compare">
                <div class="rs-ref-swatch-col">
                  <span class="rs-ref-label">Current</span>
                  <span class="rs-ref-swatch" :style="{ background: r.currentHex }" />
                  <span class="rs-ref-hex">{{ r.currentHex }}</span>
                </div>
                <svg class="rs-ref-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
                <div class="rs-ref-swatch-col">
                  <span class="rs-ref-label">Refined</span>
                  <span class="rs-ref-swatch rs-ref-swatch-refined" :style="{ background: r.suggestedHex }" />
                  <span class="rs-ref-hex">{{ r.suggestedHex }}</span>
                </div>
              </div>
              <p class="rs-ref-rationale">{{ r.rationale }}</p>
              <div class="rs-ref-actions">
                <button class="rs-sug-btn" @click="replaceRefinement(r)" title="Replace color">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  Replace
                </button>
                <button class="rs-sug-btn" @click="shuffleRefinement(r)" title="Shuffle alternative">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/>
                    <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
                  </svg>
                  Shuffle
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Suggestions -->
      <div class="rs-panel" :class="{ collapsed: !openPanels.suggestions }">
        <button class="rs-header" @click="toggle('suggestions')">
          <span class="rs-title">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            Color Suggestions
          </span>
          <span class="rs-header-right">
            <span class="rs-badge accent">{{ suggestions.length }}</span>
            <svg class="rs-chevron" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
          </span>
        </button>
        <div class="rs-body">
          <div v-if="suggestions.length === 0" class="rs-empty">
            <span>None needed</span>
          </div>
          <div v-else class="rs-list">
            <div v-for="s in suggestions" :key="s.id" class="rs-suggestion">
              <div class="rs-sug-info">
                <span class="rs-sug-color" :style="{ background: s.hex }" />
                <div class="rs-sug-text">
                  <span class="rs-sug-title">{{ s.title }}</span>
                  <span class="rs-sug-role">{{ s.role }}</span>
                </div>
              </div>
              <div class="rs-sug-actions">
                <button class="rs-sug-btn" @click="addSuggestion(s)" title="Add color">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button class="rs-sug-btn" @click="shuffleSuggestion(s)" title="Regenerate">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                </button>
              </div>
            </div>
            <!-- <button v-if="suggestions.length > maxVisibleSuggestions" class="rs-more-btn" @click="showAllSuggestions = !showAllSuggestions">
              {{ showAllSuggestions ? 'Show less' : `+${suggestions.length - maxVisibleSuggestions} more` }}
            </button> -->
          </div>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import { usePaletteAnalysis } from '../../composables/usePaletteAnalysis'
import { useAdvancedAnalysis } from '../../composables/useAdvancedAnalysis'
import type { Suggestion } from '../../composables/usePaletteAnalysis'

const palette = usePaletteStore()
const themeStore = useThemeStore()
const { issues, suggestions, healthScore, regenerateSuggestion } = usePaletteAnalysis(
  () => palette.colors,
  () => themeStore.isDark,
  () => palette.contrastPairs
)
const { scores, insightGroups, refinements, cycleRefinement } = useAdvancedAnalysis(
  () => palette.colors,
  () => themeStore.isDark,
  () => palette.contrastPairs
)

const openPanels = ref<Record<string, boolean>>({
  issues: false,
  suggestions: true,
  refinements: true,
})

function toggle(key: string) {
  openPanels.value[key] = !openPanels.value[key]
}

const criticalCount = computed(() => issues.value.filter(i => i.severity === 'critical').length)
const healthColor = computed(() => {
  if (healthScore.value >= 80) return 'var(--success)'
  if (healthScore.value >= 60) return 'var(--warning)'
  return 'var(--error)'
})

function scoreColor(v: number): string {
  if (v >= 80) return 'var(--success)'
  if (v >= 60) return 'var(--warning)'
  return 'var(--error)'
}

function addSuggestion(s: Suggestion) {
  palette.addColor(s.hex)
  const c = palette.colors[palette.colors.length - 1]
  palette.updateColor(c.id, { roles: [s.role as any], name: s.title.replace('Add ', '').replace('a ', '').replace('an ', '') })
}

function shuffleSuggestion(s: Suggestion) {
  regenerateSuggestion(s.id)
}

function replaceRefinement(r: { colorId: string, suggestedHex: string }) {
  palette.updateColor(r.colorId, { hex: r.suggestedHex })
}

function shuffleRefinement(r: { colorId: string }) {
  cycleRefinement(r.colorId)
}

watch(insightGroups, (groups) => {
  const panels = openPanels.value
  groups.forEach(g => {
    if (!(g.label in panels)) {
      panels[g.label] = false
    }
  })
}, { immediate: true })
</script>

<style scoped>
.right-sidebar {
  width: var(--right-sidebar-width, 260px);
  background: var(--bg-surface);
  border-left: 1px solid var(--border-default);
  flex-shrink: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.rs-scroll {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;
  scrollbar-color: var(--border-strong) transparent;
  padding-bottom:64px;
}

.rs-scroll::-webkit-scrollbar { width: 4px; }
.rs-scroll::-webkit-scrollbar-track { background: transparent; }
.rs-scroll::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 99px; }

.rs-panel {
  border-bottom: 1px solid var(--border-default);
}

.rs-panel.collapsed .rs-body {
  display: none;
}

.rs-panel.collapsed .rs-chevron {
  transform: rotate(-90deg);
}

.rs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 6px;
  background: none;
  border: none;
  width: 100%;
  color: inherit;
  text-align: left;
}

button.rs-header {
  cursor: pointer;
  transition: background 0.1s;
}

button.rs-header:hover {
  background: var(--bg-subtle);
}

.rs-header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rs-chevron {
  color: var(--text-tertiary);
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.rs-title {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rs-badge {
  font-size: 10px;
  font-weight: 700;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
  padding: 1px 7px;
  border-radius: 99px;
  min-width: 18px;
  text-align: center;
}

.rs-badge.critical {
  background: var(--error-soft);
  color: var(--error);
}

.rs-badge.accent {
  background: var(--accent-soft);
  color: var(--accent);
}

.rs-body {
  padding: 0 12px 8px;
}

.rs-empty {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px;
  font-size: 11px;
  color: var(--success);
  font-weight: 500;
}

.rs-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

/* ── Composite Scores ── */

.rs-scores {
  padding: 4px 2px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rs-score-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.rs-score-label {
  font-size: 10px;
  color: var(--text-tertiary);
  width: 90px;
  flex-shrink: 0;
}

.rs-score-bar-track {
  flex: 1;
  height: 4px;
  background: var(--bg-subtle);
  border-radius: 99px;
  overflow: hidden;
}

.rs-score-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s ease;
}

.rs-score-bar-fill.practicality { background: var(--accent); }
.rs-score-bar-fill.cohesion { background: var(--info); }
.rs-score-bar-fill.fatigue { background: var(--success); }

.rs-score-value {
  font-size: 11px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
  width: 24px;
  text-align: right;
}

/* ── Insights ── */

.rs-insight {
  padding: 5px 8px;
  border-radius: 5px;
  margin-bottom: 2px;
}

.rs-insight.sev-critical {
  background: var(--error-soft);
}

.rs-insight.sev-warning {
  background: var(--warning-soft);
}

.rs-insight.sev-info {
  background: transparent;
}

.rs-insight.sev-success {
  background: var(--success-soft);
}

.rs-insight-top {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rs-insight-sev-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

.sev-critical .rs-insight-sev-dot { background: var(--error); }
.sev-warning .rs-insight-sev-dot { background: var(--warning); }
.sev-info .rs-insight-sev-dot { background: var(--info); }
.sev-success .rs-insight-sev-dot { background: var(--success); }

.rs-insight-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
}

.rs-insight-desc {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 2px;
  line-height: 1.4;
}

/* ── Legacy Issues ── */

.rs-issue {
  padding: 6px 8px;
  border-radius: 5px;
}

.rs-issue.severity-critical {
  background: var(--error-soft);
}

.rs-issue.severity-warning {
  background: var(--warning-soft);
}

.rs-issue.severity-info {
  background: transparent;
}

.rs-issue-top {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rs-issue-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  flex: 1;
  line-height: 1.4;
}

.rs-issue-sev {
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}

.severity-critical .rs-issue-sev { color: var(--error); }
.severity-warning .rs-issue-sev { color: var(--warning); }
.severity-info .rs-issue-sev { color: var(--info); }

.rs-issue-desc {
  font-size: 10px;
  color: var(--text-tertiary);
  margin-top: 2px;
  line-height: 1.4;
}

.rs-more-btn {
  font-size: 10px;
  color: var(--accent);
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  text-align: left;
}

.rs-more-btn:hover {
  text-decoration: underline;
}

/* ── Suggestions ── */

.rs-suggestion {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 5px 8px;
  border-radius: 5px;
  transition: background 0.1s;
}

.rs-suggestion:hover {
  background: var(--bg-subtle);
}

.rs-sug-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}

.rs-sug-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.08);
}

.rs-sug-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.rs-sug-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rs-sug-role {
  font-size: 9px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rs-sug-actions {
  display: flex;
  gap: 2px;
  flex-shrink: 0;
}

.rs-sug-btn {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: var(--text-tertiary);
  transition: all 0.1s;
}

.rs-sug-btn:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.rs-ref-actions .rs-sug-btn {
  width: auto;
  padding: 0 7px;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
}

/* ── Health ── */

.health-score {
  font-size: 13px;
  font-weight: 700;
  font-family: 'JetBrains Mono', monospace;
}

.health-bar-track {
  height: 4px;
  background: var(--bg-subtle);
  border-radius: 99px;
  overflow: hidden;
}

.health-bar-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s;
}

/* ── Refinements ── */

.rs-refinement {
  padding: 6px 8px;
  border-radius: 5px;
  background: var(--bg-subtle);
  margin-bottom: 6px;
}

.rs-ref-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.rs-ref-explain {
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 8px 0;
}

.rs-ref-compare {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
}

.rs-ref-swatch-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.rs-ref-label {
  font-size: 8px;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rs-ref-swatch {
  width: 100%;
  height: 28px;
  border-radius: 4px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1);
}

.rs-ref-swatch-refined {
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), 0 0 0 1.5px var(--accent);
}

.rs-ref-arrow {
  flex-shrink: 0;
  color: var(--text-tertiary);
}

.rs-ref-hex {
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary);
}

.rs-ref-rationale {
  font-size: 10px;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0 0 6px 0;
  font-style: italic;
}

.rs-ref-actions {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}
</style>
