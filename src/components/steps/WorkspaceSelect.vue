<template>
  <div class="workspace-select">
    <div class="ws-header">
      <h1 class="ws-title">How will you use this palette?</h1>
      <p class="ws-sub">Select a workspace to tailor analysis, scoring and previews to your needs.</p>
    </div>
    <div class="ws-grid">
      <button
        v-for="w in workspace.allWorkspaces"
        :key="w.id"
        class="ws-card"
        :class="{ selected: workspace.activeWorkspace === w.id }"
        @click="selectWorkspace(w.id)"
      >
        <div class="ws-card-icon">
          <component :is="workspaceIcons[w.id]" />
        </div>
        <div class="ws-card-body">
          <h3 class="ws-card-title">{{ w.name }}</h3>
          <p class="ws-card-desc">{{ w.description }}</p>
          <div class="ws-card-detail">{{ w.detail }}</div>
          <div class="ws-card-focus">
            <span v-for="f in w.focus" :key="f" class="ws-focus-chip">{{ f }}</span>
          </div>
        </div>
        <div class="ws-card-check">
          <svg v-if="workspace.activeWorkspace === w.id" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useWorkspaceStore } from '../../stores/workspace'
import type { WorkspaceId } from '../../workspaces/types'

const workspace = useWorkspaceStore()

const workspaceIcons: Record<string, object> = {
  'ui-design': UIIcon,
  'data-viz': DataVizIcon,
  'accessibility': AccessIcon,
  'branding': BrandIcon,
}

function selectWorkspace(id: WorkspaceId) {
  workspace.selectWorkspace(id)
}
</script>

<script lang="ts">
const UIIcon = {
  template: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <line x1="3" y1="9" x2="21" y2="9"/>
    <line x1="9" y1="21" x2="9" y2="9"/>
    <rect x="13" y="13" width="6" height="6" rx="1"/>
  </svg>`
}
const DataVizIcon = {
  template: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    <rect x="2" y="2" width="20" height="20" rx="2" opacity="0.2"/>
  </svg>`
}
const AccessIcon = {
  template: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>`
}
const BrandIcon = {
  template: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>`
}
</script>

<style scoped>
.workspace-select {
  max-width: 800px;
  margin: 0 auto;
}

.ws-header {
  margin-bottom: 32px;
}

.ws-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px;
}

.ws-sub {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0;
}

.ws-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.ws-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  border-radius: var(--radius);
  border: 1.5px solid var(--border-default);
  background: var(--bg-surface);
  cursor: pointer;
  text-align: left;
  color: var(--text-primary);
  position: relative;
  transition: all 0.2s;
}

.ws-card:hover {
  border-color: var(--accent);
  background: var(--bg-elevated);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}

.ws-card.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent);
}

.ws-card-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--bg-subtle);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.ws-card.selected .ws-card-icon {
  background: var(--accent);
  color: white;
}

.ws-card-title {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
}

.ws-card-desc {
  font-size: 12.5px;
  color: var(--text-secondary);
  margin: 0 0 8px;
  line-height: 1.5;
}

.ws-card-detail {
  font-size: 11px;
  color: var(--text-tertiary);
  line-height: 1.5;
  margin-bottom: 10px;
}

.ws-card-focus {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.ws-focus-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 99px;
  background: var(--bg-subtle);
  color: var(--text-tertiary);
  border: 1px solid var(--border-default);
}

.ws-card.selected .ws-focus-chip {
  background: color-mix(in srgb, var(--accent) 10%, transparent);
  border-color: color-mix(in srgb, var(--accent) 25%, transparent);
  color: var(--accent);
}

.ws-card-check {
  position: absolute;
  top: 12px;
  right: 12px;
  color: var(--accent);
}

@media (max-width: 640px) {
  .ws-grid {
    grid-template-columns: 1fr;
  }
}
</style>
