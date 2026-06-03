<template>
  <div class="a11y-preview">
    <div class="a11y-grid">
      <!-- WCAG Overview -->
      <div class="a11y-card">
        <div class="a11y-card-title">WCAG Contrast Overview</div>
        <div class="a11y-stats">
          <div class="a11y-stat">
            <span class="a11y-stat-val" :style="{ color: 'var(--success)' }">{{ aaPass }}</span>
            <span class="a11y-stat-label">AA Pass</span>
          </div>
          <div class="a11y-stat">
            <span class="a11y-stat-val" :style="{ color: 'var(--error)' }">{{ aaFail }}</span>
            <span class="a11y-stat-label">AA Fail</span>
          </div>
          <div class="a11y-stat">
            <span class="a11y-stat-val" :style="{ color: 'var(--warning)' }">{{ aaaPass }}</span>
            <span class="a11y-stat-label">AAA Pass</span>
          </div>
        </div>
      </div>

      <!-- Color Blindness Simulation -->
      <div class="a11y-card">
        <div class="a11y-card-title">Color Blindness Simulation</div>
        <div class="a11y-cb-row" v-for="cb in cbTypes" :key="cb.name">
          <span class="a11y-cb-label">{{ cb.name }}</span>
          <div class="a11y-cb-swatches">
            <span
              v-for="c in palette.colors"
              :key="c.id"
              class="a11y-cb-swatch"
              :style="{ background: cb.simulate(c.hex) }"
              :title="c.hex"
            />
          </div>
        </div>
      </div>

      <!-- Contrast Pair Samples -->
      <div class="a11y-card a11y-card-wide">
        <div class="a11y-card-title">Sample Text Pairings</div>
        <div class="a11y-samples">
          <div
            v-for="(pair, i) in samplePairs"
            :key="i"
            class="a11y-sample"
            :style="{ background: pair.bg, color: pair.fg }"
          >
            <div class="a11y-sample-text">
              <span class="a11y-sample-heading">Heading Text</span>
              <span class="a11y-sample-body">Body text at 12px — this is how your contrast performs at reading size.</span>
            </div>
            <div class="a11y-sample-badge" :class="pair.pass ? 'pass' : 'fail'">
              {{ pair.ratio.toFixed(1) }}:1
            </div>
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

const palette = usePaletteStore()

function simulateCVD(hex: string, type: 'p' | 'd' | 't'): string {
  try {
    const c = chroma(hex)
    const [r, g, b] = [c.get('rgb.r'), c.get('rgb.g'), c.get('rgb.b')]
    const factors: Record<string, [number, number, number]> = {
      p: [0.625, 0.7, 0.9],
      d: [0.7, 0.625, 0.9],
      t: [0.95, 0.95, 0.5],
    }
    const f = factors[type]
    return chroma(clamp(r * f[0]), clamp(g * f[1]), clamp(b * f[2])).hex()
  } catch { return hex }
}

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)))
}

const cbTypes = [
  { name: 'Protanopia', simulate: (h: string) => simulateCVD(h, 'p') },
  { name: 'Deuteranopia', simulate: (h: string) => simulateCVD(h, 'd') },
  { name: 'Tritanopia', simulate: (h: string) => simulateCVD(h, 't') },
]

const pairs = computed(() => palette.contrastPairs)

const aaPass = computed(() => pairs.value.filter(p => p.wcagAA && !p.ignored).length)
const aaFail = computed(() => pairs.value.filter(p => !p.wcagAA && !p.ignored).length)
const aaaPass = computed(() => pairs.value.filter(p => p.wcagAAA && !p.ignored).length)

const samplePairs = computed(() => {
  const colors = palette.colors
  if (colors.length < 2) return []
  const samples: { fg: string; bg: string; ratio: number; pass: boolean }[] = []
  for (let i = 0; i < Math.min(colors.length, 6); i++) {
    const bg = colors[i].hex
    const fgIdx = (i + 1) % colors.length
    const fg = colors[fgIdx].hex
    try {
      const ratio = chroma.contrast(fg, bg)
      samples.push({ fg, bg, ratio: Math.round(ratio * 10) / 10, pass: ratio >= 4.5 })
    } catch { /* skip */ }
  }
  return samples
})
</script>

<style scoped>
.a11y-preview {
  padding: 4px 0;
}

.a11y-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.a11y-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 14px;
}

.a11y-card-wide {
  grid-column: 1 / -1;
}

.a11y-card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.a11y-stats {
  display: flex;
  gap: 16px;
}

.a11y-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.a11y-stat-val {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.2;
}

.a11y-stat-label {
  font-size: 10px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.a11y-cb-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.a11y-cb-label {
  font-size: 11px;
  color: var(--text-secondary);
  width: 80px;
  flex-shrink: 0;
}

.a11y-cb-swatches {
  display: flex;
  gap: 3px;
}

.a11y-cb-swatch {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid var(--border-default);
}

.a11y-samples {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.a11y-sample {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-radius: 8px;
  gap: 12px;
}

.a11y-sample-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.a11y-sample-heading {
  font-size: 13px;
  font-weight: 700;
}

.a11y-sample-body {
  font-size: 11px;
  opacity: 0.85;
  line-height: 1.4;
}

.a11y-sample-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  flex-shrink: 0;
  white-space: nowrap;
}

.a11y-sample-badge.pass {
  background: color-mix(in srgb, var(--success) 15%, transparent);
  color: var(--success);
}

.a11y-sample-badge.fail {
  background: color-mix(in srgb, var(--error) 15%, transparent);
  color: var(--error);
}

@media (max-width: 640px) {
  .a11y-grid { grid-template-columns: 1fr; }
}
</style>
