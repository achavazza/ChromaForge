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
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWizardStore } from '../../stores/wizard'

const wizard = useWizardStore()
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
  gap: 8px;
}

button:disabled {
  opacity: 0.4;
  pointer-events: none;
}
</style>
