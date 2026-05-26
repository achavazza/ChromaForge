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
        v-for="step in visibleSteps"
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

    <!-- Bottom Controls -->
    <div class="sidebar-bottom">
      <!-- Color count -->
      <div class="palette-meta">
        <span class="meta-dot" />
        <span>{{ palette.colors.length }} colors</span>
      </div>

      <div class="sidebar-actions">
        <button class="sidebar-action-btn" @click="savePalette" title="Save palette to localStorage">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Palette
        </button>
        <button class="sidebar-action-btn" @click="downloadPalette" title="Download palette as JSON">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download JSON
        </button>
        <button class="sidebar-action-btn" @click="downloadPalettePNG" title="Download palette as PNG image">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          Download PNG
        </button>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWizardStore } from '../../stores/wizard'
import { usePaletteStore } from '../../stores/palette'
import { useThemeStore } from '../../stores/theme'
import { generateTonalScaleOKLCH } from '../../composables/useColorUtils'

const wizard = useWizardStore()
const palette = usePaletteStore()
const theme = useThemeStore()

const visibleSteps = computed(() => wizard.steps.filter(s => s.id !== 3))

const savedLabel = ref('Save Palette')

function savePalette() {
  const hexes = palette.colors.map(c => c.hex)
  if (!hexes.length) return
  const name = window.prompt('Name this palette:', `Palette ${Date.now()}`)
  if (!name) return
  const saved = JSON.parse(localStorage.getItem('chromaforge-saved') || '[]')
  saved.push({ label: name, colors: hexes })
  localStorage.setItem('chromaforge-saved', JSON.stringify(saved))
  savedLabel.value = 'Saved!'
  setTimeout(() => { savedLabel.value = 'Save Palette' }, 1500)
}

function downloadPalette() {
  const data = JSON.stringify(palette.colors.map(c => ({
    hex: c.hex,
    name: c.name,
    roles: c.roles,
    locked: c.locked,
  })), null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chromaforge-palette-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function downloadPalettePNG() {
  const colors = palette.colors
  if (!colors.length) return
  const dark = theme.isDark

  const PAD = 28
  const SW = 56
  const SR = 8
  const GAP = 16
  const SCALE_H = 14
  const SCALE_W = 22
  const SCALE_GAP = 2
  const ROW_H = SW + 8 + SCALE_H + 18
  const SEP_Y = 80
  const W = 820
  const TEXT_X = PAD + SW + GAP
  const HEX_W = 130
  const NAME_W = 150

  const bgColor = dark ? '#13131e' : '#f4f4f8'
  const textColor = dark ? '#e8e8f4' : '#1a1a24'
  const mutedColor = dark ? '#7878a0' : '#7878a0'
  const nameColor = dark ? '#b8b8d0' : '#4a4a60'
  const sepColor = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'
  const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
  const scaleBorder = dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'

  const headerEnd = SEP_Y + 16
  const h = headerEnd + colors.length * ROW_H + PAD
  const canvas = document.createElement('canvas')
  canvas.width = W * 2
  canvas.height = h * 2
  const ctx = canvas.getContext('2d')!
  ctx.scale(2, 2)

  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, W, h)

  ctx.fillStyle = textColor
  ctx.font = 'bold 20px Inter, system-ui, sans-serif'
  ctx.fillText('ChromaForge Palette', PAD, PAD + 18)
  ctx.fillStyle = mutedColor
  ctx.font = '12px Inter, system-ui, sans-serif'
  ctx.fillText(`${colors.length} color${colors.length !== 1 ? 's' : ''} · ${new Date().toLocaleDateString()}`, PAD, PAD + 38)

  ctx.strokeStyle = sepColor
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(PAD, SEP_Y)
  ctx.lineTo(W - PAD, SEP_Y)
  ctx.stroke()

  let y = headerEnd

  for (const c of colors) {
    const rowY = y

    ctx.beginPath()
    ctx.roundRect(PAD, rowY, SW, SW, SR)
    ctx.fillStyle = c.hex
    ctx.fill()
    ctx.strokeStyle = borderColor
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.fillStyle = textColor
    ctx.font = 'bold 13px SF Mono, JetBrains Mono, monospace'
    ctx.fillText(c.hex, TEXT_X, rowY + 16)

    ctx.fillStyle = nameColor
    ctx.font = '13px Inter, system-ui, sans-serif'
    ctx.fillText(c.name || '—', TEXT_X + HEX_W, rowY + 16)

    ctx.fillStyle = mutedColor
    ctx.font = '12px Inter, system-ui, sans-serif'
    const roleStr = c.roles.length ? c.roles.join(', ') : '\u2014'
    ctx.fillText(roleStr, TEXT_X + HEX_W + NAME_W, rowY + 16)

    const scaleY = rowY + SW + 8
    const { scale } = generateTonalScaleOKLCH(c.hex, 9)
    for (let si = 0; si < scale.length; si++) {
      const sx = PAD + si * (SCALE_W + SCALE_GAP)
      ctx.fillStyle = scale[si]
      ctx.fillRect(sx, scaleY, SCALE_W, SCALE_H)
      ctx.strokeStyle = scaleBorder
      ctx.lineWidth = 0.5
      ctx.strokeRect(sx, scaleY, SCALE_W, SCALE_H)
    }

    y += ROW_H
  }

  canvas.toBlob(b => {
    if (!b) return
    const url = URL.createObjectURL(b)
    const a = document.createElement('a')
    a.href = url
    a.download = `chromaforge-palette-${Date.now()}.png`
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}
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

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sidebar-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid var(--border-default);
  background: var(--bg-subtle);
  color: var(--text-primary);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.sidebar-action-btn:hover {
  background: var(--bg-elevated);
  border-color: var(--border-strong);
}

.sidebar-action-btn svg {
  flex-shrink: 0;
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
