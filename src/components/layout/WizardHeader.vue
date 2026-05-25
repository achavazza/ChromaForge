<template>
  <header class="wizard-header">
    <div class="header-left">
      <div class="breadcrumb">
        <span class="breadcrumb-step">Step {{ wizard.currentStep }} of 5</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="breadcrumb-sep">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
        <span class="breadcrumb-title">{{ currentStepData?.title }}</span>
      </div>
      <p class="header-desc">{{ currentStepData?.description }}</p>
    </div>
    <div class="header-right">
      <!-- Progress dots -->
      <div class="progress-dots">
        <div
          v-for="step in wizard.steps"
          :key="step.id"
          class="progress-dot"
          :class="{
            active: wizard.currentStep === step.id,
            completed: step.completed,
          }"
          @click="wizard.goTo(step.id)"
          :title="step.title"
        />
      </div>
      <!-- Navigation buttons -->
      <div class="nav-buttons">
        <button class="btn btn-secondary btn-sm" @click="wizard.prev()" :disabled="wizard.currentStep === 1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back
        </button>
        <button class="btn btn-primary btn-sm" @click="wizard.next()" :disabled="wizard.currentStep === 5">
          Next
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
      <div class="header-sep" />
      <!-- Theme toggle -->
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
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '../../stores/wizard'
import { useThemeStore } from '../../stores/theme'

const wizard = useWizardStore()
const themeStore = useThemeStore()
const currentStepData = computed(() => wizard.steps.find(s => s.id === wizard.currentStep))
</script>

<style scoped>
.wizard-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-default);
  position: sticky;
  top: 0;
  z-index: 40;
  backdrop-filter: blur(12px);
  gap: 16px;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
}

.breadcrumb-step {
  font-size: 11px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.breadcrumb-sep {
  color: var(--text-tertiary);
  opacity: 0.5;
}

.breadcrumb-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.header-desc {
  font-size: 11px;
  color: var(--text-tertiary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.progress-dots {
  display: flex;
  gap: 6px;
  align-items: center;
}

.progress-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--border-strong);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.progress-dot.active {
  width: 20px;
  border-radius: 4px;
  background: var(--accent);
}

.progress-dot.completed {
  background: var(--success);
}

.progress-dot:hover {
  transform: scale(1.2);
}

.nav-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

button:disabled {
  opacity: 0.4;
  pointer-events: none;
}

.header-sep {
  width: 1px;
  height: 24px;
  background: var(--border-default);
}

.theme-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background 0.15s, color 0.15s;
}

.theme-toggle:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toggle-track {
  width: 28px;
  height: 16px;
  border-radius: 99px;
  background: var(--border-strong);
  display: flex;
  align-items: center;
  padding: 0 3px;
  transition: background 0.2s;
  position: relative;
}

.toggle-track.light {
  background: #e5e7eb;
}

.toggle-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: absolute;
  left: 2px;
}

.toggle-track.light .toggle-thumb {
  transform: translateX(12px);
}

.toggle-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
