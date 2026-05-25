<template>
  <aside class="sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="8" cy="8" r="5" fill="#6366f1" opacity="0.9"/>
          <circle cx="16" cy="8" r="5" fill="#818cf8" opacity="0.7"/>
          <circle cx="12" cy="15" r="5" fill="#a5b4fc" opacity="0.6"/>
        </svg>
      </div>
      <div class="logo-text">
        <span class="logo-name">ChromaForge</span>
        <span class="logo-tagline">Color System Builder</span>
      </div>
    </div>

    <div class="sidebar-divider" />

    <!-- Steps -->
    <nav class="sidebar-nav">
      <div class="nav-label">Workflow</div>
      <button
        v-for="step in wizard.steps"
        :key="step.id"
        class="sidebar-step"
        :class="{
          active: wizard.currentStep === step.id,
          completed: step.completed,
          upcoming: !step.completed && wizard.currentStep !== step.id && step.id > wizard.currentStep,
        }"
        @click="wizard.goTo(step.id)"
      >
        <div class="step-indicator">
          <span v-if="step.completed" class="step-check">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </span>
          <span v-else class="step-number">{{ step.id }}</span>
        </div>
        <div class="step-info">
          <span class="step-title">{{ step.title }}</span>
          <span class="step-desc">{{ step.description }}</span>
        </div>
        <div v-if="wizard.currentStep === step.id" class="step-active-dot" />
      </button>
    </nav>

    <div class="sidebar-spacer" />

    <!-- Health Score -->
    <div class="sidebar-health">
      <div class="health-header">
        <span class="health-label">Palette Health</span>
        <span class="health-score" :style="{ color: healthColor }">{{ healthScore }}%</span>
      </div>
      <div class="health-bar-track">
        <div
          class="health-bar-fill"
          :style="{ width: healthScore + '%', background: healthColor }"
        />
      </div>
    </div>

    <div class="sidebar-divider" />

    <!-- Bottom Controls -->
    <div class="sidebar-bottom">
      <!-- Color count -->
      <div class="palette-meta">
        <span class="meta-dot" />
        <span>{{ palette.colors.length }} colors</span>
      </div>

      <!-- Dark/Light Toggle -->
      <button class="theme-toggle" @click="themeStore.toggle()" :title="themeStore.isDark ? 'Switch to Light' : 'Switch to Dark'">
        <span class="toggle-track" :class="{ light: !themeStore.isDark }">
          <span class="toggle-thumb">
            <svg v-if="themeStore.isDark" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="5"/>
              <line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/>
              <line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
          </span>
        </span>
        <span class="toggle-label">{{ themeStore.isDark ? 'Dark' : 'Light' }}</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '../../stores/wizard'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import { usePaletteAnalysis } from '../../composables/usePaletteAnalysis'

const wizard = useWizardStore()
const palette = usePaletteStore()
const themeStore = useThemeStore()
const { healthScore } = usePaletteAnalysis(() => palette.colors, () => themeStore.isDark)

const healthColor = computed(() => {
  if (healthScore.value >= 80) return 'var(--success)'
  if (healthScore.value >= 60) return 'var(--warning)'
  return 'var(--error)'
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  width: var(--sidebar-width);
  height: 100vh;
  background: var(--bg-surface);
  border-right: 1px solid var(--border-default);
  display: flex;
  flex-direction: column;
  z-index: 50;
  overflow-y: auto;
  scrollbar-width: none;
}

.sidebar::-webkit-scrollbar { display: none; }

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px 16px;
}

.logo-icon {
  width: 36px;
  height: 36px;
  background: var(--accent-soft);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.logo-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.logo-tagline {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 400;
}

.sidebar-divider {
  height: 1px;
  background: var(--border-default);
  margin: 0 0;
}

.sidebar-nav {
  padding: 12px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0 8px;
  margin-bottom: 6px;
}

.sidebar-step {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  border-radius: 8px;
  border: none;
  background: transparent;
  cursor: pointer;
  width: 100%;
  text-align: left;
  position: relative;
  transition: background 0.15s ease;
  color: var(--text-secondary);
}

.sidebar-step:hover {
  background: var(--bg-subtle);
  color: var(--text-primary);
}

.sidebar-step.active {
  background: var(--accent-soft);
  color: var(--accent);
}

.sidebar-step.completed {
  color: var(--text-secondary);
}

.sidebar-step.completed .step-indicator {
  background: var(--success-soft);
  color: var(--success);
}

.sidebar-step.upcoming {
  opacity: 0.5;
}

.step-indicator {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}

.sidebar-step.active .step-indicator {
  background: var(--accent);
  color: white;
}

.step-check, .step-number {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.step-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.step-title {
  font-size: 12.5px;
  font-weight: 600;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.step-desc {
  font-size: 10.5px;
  color: var(--text-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sidebar-step.active .step-desc {
  color: var(--accent);
  opacity: 0.7;
}

.step-active-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
  margin-left: auto;
  flex-shrink: 0;
  animation: pulse-soft 2s ease-in-out infinite;
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-health {
  padding: 12px 16px;
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.health-label {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
}

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

.sidebar-bottom {
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.palette-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--text-tertiary);
}

.meta-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 7px 10px;
  cursor: pointer;
  transition: all 0.15s;
  width: 100%;
}

.theme-toggle:hover {
  border-color: var(--border-strong);
  background: var(--bg-elevated);
}

.toggle-track {
  width: 32px;
  height: 18px;
  background: #374151;
  border-radius: 99px;
  position: relative;
  transition: background 0.2s;
  flex-shrink: 0;
}

.toggle-track.light {
  background: #e0e7ff;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  color: #374151;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.toggle-track.light .toggle-thumb {
  transform: translateX(14px);
  color: #6366f1;
}

.toggle-label {
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
}
</style>
