<template>
  <div class="suggestion-card">
    <div class="swatch-col">
      <div
        class="suggestion-swatch"
        :style="{ background: suggestion.hex }"
      />
      <span class="swatch-hex">{{ suggestion.hex }}</span>
    </div>
    <div class="suggestion-body">
      <div class="suggestion-header">
        <span class="suggestion-title">{{ suggestion.title }}</span>
        <span class="role-chip">{{ suggestion.role }}</span>
      </div>
      <p class="suggestion-explanation">{{ suggestion.explanation }}</p>
      <p class="suggestion-accessibility">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        {{ suggestion.accessibilityImpact }}
      </p>
    </div>
    <div class="suggestion-actions">
      <button class="btn btn-primary btn-sm" @click="emit('add')" title="Add to palette">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        Add
      </button>
      <button class="btn btn-ghost btn-sm" @click="emit('shuffle')" title="Random">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="23 4 23 10 17 10"/>
          <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        Random
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Suggestion } from '../../composables/usePaletteAnalysis'

const props = defineProps<{ suggestion: Suggestion }>()
const emit = defineEmits<{ add: []; shuffle: [] }>()
</script>

<style scoped>
.suggestion-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--bg-subtle);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  transition: all 0.15s;
}

.suggestion-card:hover {
  border-color: var(--border-default);
  background: var(--bg-surface);
}

.swatch-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.suggestion-swatch {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.1), var(--shadow-sm);
  transition: transform 0.15s;
}

.suggestion-card:hover .suggestion-swatch {
  transform: scale(1.05);
}

.swatch-hex {
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: var(--text-tertiary);
}

.suggestion-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.suggestion-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

.role-chip {
  font-size: 9px;
  font-weight: 600;
  color: var(--accent);
  background: var(--accent-soft);
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.suggestion-explanation {
  font-size: 11px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.suggestion-accessibility {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-tertiary);
  line-height: 1.4;
}

.suggestion-actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
</style>
