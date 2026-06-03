<template>
  <div class="preview-ui" :style="cssVars">
    <!-- Labels -->
    <div v-if="label" class="preview-label-badge">{{ label }}</div>

    <!-- Two-column: Hero (left) + Form (right) -->
    <div class="preview-two-col-layout">
      <!-- Hero Section -->
      <div class="preview-hero">
        <div class="hero-content">
          <div class="hero-badge">New Release</div>
          <h2 class="hero-heading">Design systems<br/>built for scale.</h2>
          <p class="hero-sub">A premium tool to craft accessible, harmonious color systems with intelligence.</p>
          <div class="hero-actions">
            <button class="preview-btn-primary">Get Started</button>
            <button class="preview-btn-outline">Learn More</button>
          </div>
        </div>
        <div class="hero-image">
          <img
            src="https://picsum.photos/500/300"
            alt="Preview"
            class="hero-img"
          />
          <div class="hero-color-overlay" />
          <div class="hero-shadow-overlay" />
          <div class="hero-wash-overlay" />
        </div>
      </div>

      <!-- Form Section -->
      <div class="preview-form-section">
        <div class="preview-form-panel">
          <div class="form-header">Contact Form</div>
          <div class="form-fields">
            <div class="form-field">
              <label class="form-label">Name</label>
              <div class="form-input default">Jane Smith</div>
            </div>
            <div class="form-field">
              <label class="form-label">Email</label>
              <div class="form-input focused">hello@example.com</div>
            </div>
            <div class="form-field">
              <label class="form-label">Company</label>
              <div class="form-input default">Acme Inc</div>
            </div>
            <div class="form-field">
              <label class="form-label">Phone</label>
              <div class="form-input default">+1 (555) 123-4567</div>
            </div>
            <div class="form-field">
              <label class="form-label">Message</label>
              <div class="form-input form-textarea">Looking forward to discussing our design system needs.</div>
            </div>
            <div class="form-field">
              <label class="form-label">Status</label>
              <div class="form-states-row">
                <span class="state-chip success">✓ Valid</span>
                <span class="state-chip warning">⚠ Review</span>
                <span class="state-chip error">✗ Error</span>
                <span class="state-chip disabled">Disabled</span>
              </div>
            </div>
            <button class="preview-btn-primary form-submit">Submit Form</button>
          </div>
        </div>
      </div>
    </div>

    <template v-if="full">
      <!-- Cards Row -->
      <div class="preview-cards">
        <div class="preview-card" v-for="card in previewCards" :key="card.title">
          <div class="card-icon" :style="{ background: card.iconBg, color: card.iconColor }">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path :d="card.icon"/>
            </svg>
          </div>
          <div class="card-info">
            <span class="card-title">{{ card.title }}</span>
            <span class="card-value">{{ card.value }}</span>
          </div>
          <span class="card-badge" :class="card.badgeType">{{ card.badge }}</span>
        </div>
      </div>

      <!-- Nav + Form Row -->
      <div class="preview-two-col">
        <!-- Navigation -->
        <div class="preview-nav-panel">
          <div class="nav-header">Navigation</div>
          <div class="nav-items">
            <div class="nav-item active">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </div>
            <div class="nav-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              Users
            </div>
            <div class="nav-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              Analytics
            </div>
            <div class="nav-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41"/><path d="M4.93 4.93l1.41 1.41"/></svg>
              Settings
            </div>
          </div>
        </div>

        </div>

        <!-- Charts Row -->
        <div class="preview-charts-row">
          <div class="chart-panel">
            <div class="chart-header">Revenue by Month</div>
            <svg class="chart-svg" viewBox="0 0 240 100" preserveAspectRatio="none">
              <rect x="8" y="55" width="18" height="37" rx="2" fill="var(--p-primary)" opacity="0.85"/>
              <rect x="32" y="35" width="18" height="57" rx="2" fill="var(--p-primary)" opacity="0.85"/>
              <rect x="56" y="48" width="18" height="44" rx="2" fill="var(--p-primary)" opacity="0.85"/>
              <rect x="80" y="20" width="18" height="72" rx="2" fill="var(--p-secondary)" opacity="0.85"/>
              <rect x="104" y="38" width="18" height="54" rx="2" fill="var(--p-secondary)" opacity="0.85"/>
              <rect x="128" y="12" width="18" height="80" rx="2" fill="var(--p-secondary)" opacity="0.85"/>
              <rect x="152" y="25" width="18" height="67" rx="2" fill="var(--p-primary)" opacity="0.85"/>
              <rect x="176" y="42" width="18" height="50" rx="2" fill="var(--p-primary)" opacity="0.85"/>
              <rect x="200" y="30" width="18" height="62" rx="2" fill="var(--p-primary)" opacity="0.85"/>
            </svg>
            <div class="chart-labels">
              <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span>
            </div>
          </div>
          <div class="chart-panel">
            <div class="chart-header">Usage Distribution</div>
            <div class="donut-wrap">
              <svg class="donut-svg" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--p-border)" stroke-width="3"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--p-primary)" stroke-width="3" stroke-dasharray="60 40" stroke-dashoffset="25" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--p-success)" stroke-width="3" stroke-dasharray="25 75" stroke-dashoffset="-10" transform="rotate(-90 21 21)"/>
                <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--p-warning)" stroke-width="3" stroke-dasharray="15 85" stroke-dashoffset="-35" transform="rotate(-90 21 21)"/>
              </svg>
              <div class="donut-center">
                <span class="donut-val">2,431</span>
                <span class="donut-label">Total</span>
              </div>
            </div>
            <div class="donut-legend">
              <span class="legend-item"><span class="legend-dot" style="background:var(--p-primary)"/>Desktop 60%</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--p-success)"/>Mobile 25%</span>
              <span class="legend-item"><span class="legend-dot" style="background:var(--p-warning)"/>Tablet 15%</span>
            </div>
          </div>
        </div>
      <div class="preview-alerts">
        <div class="preview-alert success">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Payment processed successfully. Your order is confirmed.
        </div>
        <div class="preview-alert warning">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><triangle/><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/></svg>
          Your subscription expires in 3 days. Renew to keep access.
        </div>
        <div class="preview-alert error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          Connection failed. Please check your network and try again.
        </div>
        <div class="preview-alert info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          New features are available. Update your workspace settings.
        </div>
      </div>

      <!-- Badges Row -->
      <div class="preview-badges-row">
        <span class="preview-badge primary">Primary</span>
        <span class="preview-badge secondary">Secondary</span>
        <span class="preview-badge success">Active</span>
        <span class="preview-badge warning">Pending</span>
        <span class="preview-badge error">Archived</span>
        <span class="preview-badge muted">Draft</span>
      </div>

    </template>
  </div>

  <!-- Palette Colors Card (separate from UI preview) -->
  <div class="palette-colors-card">
    <div class="palette-colors-title">Palette Colors</div>
    <div class="palette-colors-row">
      <div
        v-for="c in colors"
        :key="c.id"
        class="palette-color-col"
        :style="{ background: c.hex, '--text-on-col': getBestTextColor(c.hex) }"
        @click="copyColor(c.hex)"
        :title="'Copy ' + c.hex"
      >
        <span class="palette-color-label">{{ c.hex.toUpperCase() }}</span>
        <span class="palette-color-name">{{ c.name || '—' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ColorEntry, SemanticRole } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import { getBestTextColor } from '../../composables/useColorUtils'

interface Props {
  colors: ColorEntry[]
  label?: string
  full?: boolean
}

const props = defineProps<Props>()
const themeStore = useThemeStore()

function findRole(role: SemanticRole, fallback = ''): string {
  return props.colors.find(c => c.roles.includes(role))?.hex || fallback
}

const cssVars = computed(() => {
  const dark = themeStore.isDark

  const bg = findRole('background', dark ? '#0f0f14' : '#f8f9fc')
  const surface = findRole('surface', bg)
  const primary = findRole('primary', '#6366f1')
  const secondary = findRole('secondary', '#818cf8')
  const textPrimary = findRole('text-primary', dark ? '#f0f0f8' : '#0f0f14')
  const textSecondary = findRole('text-secondary', dark ? '#9898b8' : '#6b6b8a')
  const success = findRole('success', '#10b981')
  const warning = findRole('warning', '#f59e0b')
  const error = findRole('error', '#ef4444')
  const info = findRole('info', '#3b82f6')
  const border = findRole('border', dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)')
  const muted = findRole('muted', dark ? '#5c5c7c' : '#a0a0b8')

  return {
    '--p-bg': bg,
    '--p-surface': surface,
    '--p-primary': primary,
    '--p-secondary': secondary,
    '--p-text': textPrimary,
    '--p-text-2': textSecondary || muted,
    '--p-success': success,
    '--p-warning': warning,
    '--p-error': error,
    '--p-info': info,
    '--p-border': border,
    '--p-muted': muted,
  }
})

function copyColor(hex: string) {
  navigator.clipboard.writeText(hex.toUpperCase())
}

const previewCards = [
  { title: 'Revenue', value: '$48,295', badge: '+12%', badgeType: 'success', iconBg: 'var(--p-primary)', iconColor: 'white', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6' },
  { title: 'Users', value: '12,431', badge: '+8%', badgeType: 'success', iconBg: 'var(--p-secondary)', iconColor: 'white', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { title: 'Errors', value: '24', badge: '-3%', badgeType: 'error', iconBg: 'color-mix(in srgb, var(--p-error) 15%, transparent)', iconColor: 'var(--p-error)', icon: 'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
]
</script>

<style scoped>
.preview-ui {
  background: var(--p-bg);
  color: var(--p-text);
  border-radius: var(--radius);
  position: relative;
  height: 100%;
  font-size: 12px;
}

.preview-two-col-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  padding: 16px 24px;
}

@media (max-width: 640px) {
  .preview-two-col-layout {
    grid-template-columns: 1fr;
  }
}

.preview-label-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 5;
  background: rgba(0,0,0,0.5);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 99px;
  backdrop-filter: blur(4px);
}

/* Hero */
.preview-hero {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  background: var(--p-bg);
  min-height: 100%;
}

.hero-content { flex: 1; min-width: 0; }

.hero-badge {
  display: inline-flex;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  background: var(--p-primary);
  color: white;
  padding: 3px 8px;
  border-radius: 99px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.hero-heading {
  font-size: 24px;
  font-weight: 900;
  color: var(--p-text);
  line-height: 1.15;
  letter-spacing: -0.04em;
  margin-bottom: 8px;
}

.hero-sub {
  font-size: 11px;
  color: var(--p-text-2);
  line-height: 1.6;
  margin-bottom: 14px;
  max-width: 280px;
}

.hero-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.preview-btn-primary {
  background: var(--p-primary);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
}

.preview-btn-outline {
  background: transparent;
  color: var(--p-text);
  border: 1px solid var(--p-border, rgba(255,255,255,0.15));
  padding: 8px 16px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.hero-image { width: 100%; position: relative; overflow: hidden; border-radius: 12px; }
.hero-image > div { position: absolute; inset: 0; pointer-events: none; border-radius: inherit; }

.hero-color-overlay {
  background: linear-gradient(135deg, var(--p-primary) 0%, var(--p-secondary) 60%, transparent 100%);
  mix-blend-mode: color;
  opacity: 0.25;
}

.hero-shadow-overlay {
  background: linear-gradient(180deg, transparent 0%, color-mix(in srgb, var(--p-primary) 20%, transparent) 70%, color-mix(in srgb, var(--p-primary) 40%, transparent) 100%);
  mix-blend-mode: multiply;
  opacity: 0.3;
}

.hero-wash-overlay {
  background: linear-gradient(225deg, var(--p-primary) 0%, transparent 50%);
  mix-blend-mode: soft-light;
  opacity: 0.2;
}

.hero-img {
  width: 100%;
  max-width: 500px;
  height: 250px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.35);
  display: block;
}

/* Cards */
.preview-cards {
  display: flex;
  gap: 8px;
  padding: 0 24px 16px;
}

.preview-card {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--p-surface);
  border: 1px solid var(--p-border, rgba(255,255,255,0.06));
  border-radius: 10px;
  padding: 12px;
  min-width: 0;
}

.card-icon {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.card-title {
  font-size: 10px;
  color: var(--p-text-2);
  font-weight: 500;
}

.card-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--p-text);
  font-family: 'JetBrains Mono', monospace;
}

.card-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 5px;
  flex-shrink: 0;
}

.card-badge.success { background: color-mix(in srgb, var(--p-success) 15%, transparent); color: var(--p-success); }
.card-badge.error { background: color-mix(in srgb, var(--p-error) 15%, transparent); color: var(--p-error); }

/* Form section (always visible) */
.preview-form-section {
  padding: 0 24px 16px;
}

/* Two col */
.preview-two-col {
  display: flex;
  gap: 8px;
  padding: 0 24px 16px;
}

.preview-nav-panel {
  background: var(--p-surface);
  border: 1px solid var(--p-border, rgba(255,255,255,0.06));
  border-radius: 10px;
  padding: 12px;
  min-width: 120px;
}

.nav-header {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--p-text-2);
  margin-bottom: 8px;
}

.nav-items { display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: var(--p-text-2);
  cursor: pointer;
  transition: all 0.1s;
}

.nav-item.active {
  background: var(--p-primary);
  color: white;
  opacity: 0.95;
}

.preview-form-panel {
  flex: 1;
  background: var(--p-surface);
  border: 1px solid var(--p-border, rgba(255,255,255,0.06));
  border-radius: 10px;
  padding: 12px;
}

.form-header {
  font-size: 11px;
  font-weight: 700;
  color: var(--p-text);
  margin-bottom: 10px;
}

.form-fields { display: flex; flex-direction: column; gap: 8px; }

.form-field { display: flex; flex-direction: column; gap: 3px; }

.form-label {
  font-size: 10px;
  color: var(--p-text-2);
  font-weight: 500;
}

.form-input {
  padding: 5px 8px;
  border-radius: 5px;
  font-size: 11px;
  border: 1px solid var(--p-border, rgba(255,255,255,0.1));
  color: var(--text-tertiary);
  background: color-mix(in srgb, var(--bg-base) 92%, var(--border-default) 8%);
}

.form-input.focused {
  border-color: var(--p-primary);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--p-primary) 20%, transparent);
}

.form-textarea {
  min-height: 48px;
  line-height: 1.5;
  resize: none;
}

.form-states-row {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.state-chip {
  font-size: 10px;
  font-weight: 600;
  padding: 3px 7px;
  border-radius: 5px;
}

.state-chip.success { background: color-mix(in srgb, var(--p-success) 15%, transparent); color: var(--p-success); }
.state-chip.warning { background: color-mix(in srgb, var(--p-warning) 15%, transparent); color: var(--p-warning); }
.state-chip.error { background: color-mix(in srgb, var(--p-error) 15%, transparent); color: var(--p-error); }
.state-chip.disabled { background: rgba(255,255,255,0.05); color: var(--p-text-2); opacity: 0.5; }

.form-submit {
  width: 100%;
  padding: 7px;
  border-radius: 6px;
  font-size: 11px;
}

/* Charts */
.preview-charts-row {
  display: flex;
  gap: 8px;
  padding: 0 24px 16px;
}

.chart-panel {
  flex: 1;
  background: var(--p-surface);
  border: 1px solid var(--p-border);
  border-radius: 10px;
  padding: 12px;
}

.chart-header {
  font-size: 11px;
  font-weight: 600;
  color: var(--p-text);
  margin-bottom: 8px;
}

.chart-svg {
  width: 100%;
  height: 80px;
  display: block;
}

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 4px;
  font-size: 8px;
  color: var(--p-text-2);
}

.donut-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 90px;
}

.donut-svg {
  width: 90px;
  height: 90px;
}

.donut-center {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1;
}

.donut-val {
  font-size: 16px;
  font-weight: 700;
  color: var(--p-text);
}

.donut-label {
  font-size: 9px;
  color: var(--p-text-2);
}

.donut-legend {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
  color: var(--p-text-2);
}

.legend-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* Alerts */
.preview-alerts {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 0 24px 16px;
}

.preview-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 7px;
  font-size: 11px;
  line-height: 1.5;
}

.preview-alert.success {
  background: color-mix(in srgb, var(--p-success) 12%, transparent);
  color: var(--p-success);
  border: 1px solid color-mix(in srgb, var(--p-success) 20%, transparent);
}
.preview-alert.warning {
  background: color-mix(in srgb, var(--p-warning) 12%, transparent);
  color: var(--p-warning);
  border: 1px solid color-mix(in srgb, var(--p-warning) 20%, transparent);
}
.preview-alert.error {
  background: color-mix(in srgb, var(--p-error) 12%, transparent);
  color: var(--p-error);
  border: 1px solid color-mix(in srgb, var(--p-error) 20%, transparent);
}
.preview-alert.info {
  background: color-mix(in srgb, var(--p-info) 12%, transparent);
  color: var(--p-info);
  border: 1px solid color-mix(in srgb, var(--p-info) 20%, transparent);
}

/* Badges */
.preview-badges-row {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  padding: 0 24px 24px;
}

.preview-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 99px;
}

.preview-badge.primary { background: var(--p-primary); color: white; }
.preview-badge.secondary { background: var(--p-secondary); color: white; }
.preview-badge.success { background: color-mix(in srgb, var(--p-success) 15%, transparent); color: var(--p-success); }
.preview-badge.warning { background: color-mix(in srgb, var(--p-warning) 15%, transparent); color: var(--p-warning); }
.preview-badge.error { background: color-mix(in srgb, var(--p-error) 15%, transparent); color: var(--p-error); }
.preview-badge.muted { background: color-mix(in srgb, var(--p-muted) 15%, transparent); color: var(--p-text-2); }

/* Palette Colors Card (separate from UI preview) */
.palette-colors-card {
  padding: 16px 0 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  margin-top: 16px;
}

.palette-colors-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-tertiary);
  margin-bottom: 10px;
  padding: 0 24px;
}

.palette-colors-row {
  display: flex;
  width: 100%;
}

.palette-color-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-end;
  height: 400px;
  cursor: pointer;
  padding: 10px;
  min-width: 0;
  transition: filter 0.15s;
}

.palette-color-col:hover {
  filter: brightness(1.08);
}

.palette-color-label {
  font-size: 11px;
  line-height: 1.3;
  color: var(--text-on-col);
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}

.palette-color-name {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-on-col);
  text-shadow: 0 1px 4px rgba(0,0,0,0.4);
  margin: 2px 0 4px;
  pointer-events: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
