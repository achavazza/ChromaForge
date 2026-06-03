<template>
  <div class="br-preview">
    <div class="br-grid">
      <!-- Hero Mockup -->
      <div class="br-card br-card-wide">
        <div class="br-card-title">Website Hero</div>
        <div class="br-hero" :style="{ background: heroBg, color: heroText }">
          <div class="br-hero-overlay" :style="{ background: heroOverlay }" />
          <div class="br-hero-content">
            <div class="br-hero-badge" :style="{ background: palette.colors[0]?.hex, color: heroBadgeText }">New</div>
            <h2 class="br-hero-title" :style="{ color: heroText }">ChromaForge</h2>
            <p class="br-hero-sub" :style="{ color: heroSub }">Color Intelligence Platform</p>
            <button class="br-hero-btn" :style="{ background: palette.colors[0]?.hex }">
              Get Started
            </button>
          </div>
        </div>
      </div>

      <!-- Social Card -->
      <div class="br-card">
        <div class="br-card-title">Social Media Card</div>
        <div class="br-social" :style="{ background: palette.colors[0]?.hex || '#6366f1' }">
          <div class="br-social-icon" :style="{ background: palette.colors[1]?.hex }">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div class="br-social-text" :style="{ color: getTextColor(palette.colors[0]?.hex) }">
            <span class="br-social-name">Brand Identity</span>
            <span class="br-social-handle">@chromaforge</span>
          </div>
        </div>
      </div>

      <!-- Ad Banner -->
      <div class="br-card">
        <div class="br-card-title">Ad Banner</div>
        <div class="br-ad" :style="{ background: palette.colors[1]?.hex || '#8b5cf6' }">
          <div class="br-ad-content" :style="{ color: getTextColor(palette.colors[1]?.hex) }">
            <span class="br-ad-head">Design Smarter</span>
            <span class="br-ad-body">With AI-powered color</span>
          </div>
        </div>
      </div>

      <!-- Marketing Card -->
      <div class="br-card br-card-wide">
        <div class="br-card-title">Marketing Section</div>
        <div class="br-marketing">
          <div
            v-for="(c, i) in palette.colors.slice(0, 3)"
            :key="c.id"
            class="br-marketing-card"
            :style="{ background: c.hex, color: getTextColor(c.hex) }"
          >
            <div class="br-marketing-icon" :style="{ background: colorMix(c.hex, 'white', 0.2) }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
              </svg>
            </div>
            <span class="br-marketing-title">Feature {{ i + 1 }}</span>
            <span class="br-marketing-desc">Powerful color tools for modern designers</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import chroma from 'chroma-js'
import { usePaletteStore } from '../../../stores/palette'
import { useWorkspaceStore } from '../../../stores/workspace'

const palette = usePaletteStore()
const workspace = useWorkspaceStore()

function getTextColor(hex: string | undefined): string {
  try {
    return chroma.contrast(hex || '#6366f1', '#fff') > 3 ? '#fff' : '#111'
  } catch { return '#fff' }
}

function colorMix(bg: string, fg: string, pct: number): string {
  try {
    const b = chroma(bg)
    const f = chroma(fg)
    return chroma.mix(b, f, pct).hex()
  } catch { return bg }
}

const ws = computed(() => workspace.definition)

const heroBg = computed(() => {
  const colors = palette.colors
  if (colors.length >= 3) return `linear-gradient(135deg, ${colors[0].hex} 0%, ${colors[2].hex} 100%)`
  if (colors.length >= 2) return `linear-gradient(135deg, ${colors[0].hex} 0%, ${colors[1].hex} 100%)`
  return `linear-gradient(135deg, ${colors[0]?.hex || '#6366f1'} 0%, #111 100%)`
})

const heroText = computed(() => getTextColor(palette.colors[0]?.hex))
const heroSub = computed(() => {
  try {
    const bg = palette.colors[0]?.hex || '#6366f1'
    return chroma(bg).brighten(1.5).hex()
  } catch { return '#ccc' }
})
const heroBadgeText = computed(() => getTextColor(palette.colors[0]?.hex))

const heroOverlay = computed(() => {
  if (palette.colors.length < 2) return 'rgba(0,0,0,0.3)'
  return `linear-gradient(180deg, transparent 0%, ${colorMix(palette.colors[1].hex, 'black', 0.6)} 100%)`
})
</script>

<style scoped>
.br-preview {
  padding: 4px 0;
}

.br-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.br-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 14px;
}

.br-card-wide {
  grid-column: 1 / -1;
}

.br-card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.br-hero {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.br-hero-overlay {
  position: absolute;
  inset: 0;
}

.br-hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px;
}

.br-hero-badge {
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 2px 10px;
  border-radius: 999px;
}

.br-hero-title {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
}

.br-hero-sub {
  font-size: 12px;
  opacity: 0.85;
}

.br-hero-btn {
  border: none;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 6px 18px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 4px;
}

.br-social {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  border-radius: 10px;
}

.br-social-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  flex-shrink: 0;
}

.br-social-text {
  display: flex;
  flex-direction: column;
}

.br-social-name {
  font-weight: 700;
  font-size: 13px;
}

.br-social-handle {
  font-size: 11px;
  opacity: 0.75;
}

.br-ad {
  border-radius: 10px;
  padding: 20px 14px;
  text-align: center;
  min-height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.br-ad-content {
  display: flex;
  flex-direction: column;
}

.br-ad-head {
  font-size: 16px;
  font-weight: 800;
}

.br-ad-body {
  font-size: 11px;
  opacity: 0.8;
}

.br-marketing {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.br-marketing-card {
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
}

.br-marketing-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.br-marketing-title {
  font-size: 13px;
  font-weight: 700;
}

.br-marketing-desc {
  font-size: 10px;
  opacity: 0.8;
  line-height: 1.4;
}

@media (max-width: 640px) {
  .br-grid { grid-template-columns: 1fr; }
  .br-marketing { grid-template-columns: 1fr; }
}
</style>
