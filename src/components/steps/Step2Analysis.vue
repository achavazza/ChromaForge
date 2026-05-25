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


  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import { usePaletteAnalysis } from '../../composables/usePaletteAnalysis'
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

</style>
