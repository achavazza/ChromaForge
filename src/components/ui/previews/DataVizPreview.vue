<template>
  <div class="dv-preview">
    <div class="dv-charts">
      <!-- Bar Chart -->
      <div class="dv-card">
        <div class="dv-card-title">Bar Chart</div>
        <div class="dv-bar-chart">
          <div
            v-for="(c, i) in palette.colors"
            :key="c.id"
            class="dv-bar"
            :style="{ height: (30 + Math.random() * 50) + '%', background: c.hex, flex: '1' }"
            :title="c.hex"
          />
        </div>
        <div class="dv-labels">
          <span v-for="(c, i) in palette.colors" :key="c.id" class="dv-label">{{ c.name || 'S' + (i + 1) }}</span>
        </div>
      </div>

      <!-- Pie Chart -->
      <div class="dv-card">
        <div class="dv-card-title">Pie Chart</div>
        <svg class="dv-pie" viewBox="0 0 42 42">
          <circle
            v-for="(seg, i) in pieSegments"
            :key="i"
            cx="21" cy="21" r="15.9"
            fill="none"
            :stroke="seg.color"
            :stroke-width="3"
            :stroke-dasharray="seg.dash"
            :stroke-dashoffset="seg.offset"
            transform="rotate(-90 21 21)"
          />
        </svg>
        <div class="dv-legend">
          <span v-for="(c, i) in palette.colors" :key="c.id" class="dv-legend-item">
            <span class="dv-legend-dot" :style="{ background: c.hex }" />
            {{ c.name || c.hex }}
          </span>
        </div>
      </div>

      <!-- Line Chart -->
      <div class="dv-card">
        <div class="dv-card-title">Line Chart</div>
        <svg class="dv-line-svg" viewBox="0 0 240 100" preserveAspectRatio="none">
          <polyline
            :points="linePoints"
            fill="none"
            :stroke="palette.colors[0]?.hex || '#6366f1'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polyline
            :points="linePoints2"
            fill="none"
            :stroke="palette.colors[1]?.hex || '#818cf8'"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-dasharray="4 2"
          />
        </svg>
        <div class="dv-labels">
          <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
        </div>
      </div>

      <!-- Scatter -->
      <div class="dv-card">
        <div class="dv-card-title">Scatter Plot</div>
        <svg class="dv-line-svg" viewBox="0 0 240 100" preserveAspectRatio="none">
          <circle
            v-for="i in 24"
            :key="i"
            :cx="5 + i * 9.6"
            :cy="20 + Math.random() * 60"
            :r="2 + Math.random() * 3"
            :fill="palette.colors[i % palette.colors.length]?.hex || '#6366f1'"
            opacity="0.8"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePaletteStore } from '../../../stores/palette'

const palette = usePaletteStore()

const total = computed(() => palette.colors.length || 1)
const pieSegments = computed(() => {
  const segs: { color: string; dash: string; offset: string }[] = []
  const circumference = 2 * Math.PI * 15.9
  const base = 100 / total.value
  let offset = 0
  for (const c of palette.colors) {
    const pct = base
    const dash = (pct / 100) * circumference
    segs.push({
      color: c.hex,
      dash: `${dash} ${circumference - dash}`,
      offset: `${-offset}`,
    })
    offset += dash
  }
  return segs
})

const linePoints = computed(() => {
  return palette.colors.slice(0, 6).map((_, i) => {
    const x = 20 + i * 40
    const y = 80 - Math.random() * 50
    return `${x},${y}`
  }).join(' ')
})

const linePoints2 = computed(() => {
  return palette.colors.slice(0, 6).map((_, i) => {
    const x = 20 + i * 40
    const y = 80 - Math.random() * 40
    return `${x},${y}`
  }).join(' ')
})
</script>

<style scoped>
.dv-preview {
  padding: 4px 0;
}

.dv-charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.dv-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-default);
  border-radius: var(--radius);
  padding: 14px;
}

.dv-card-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-tertiary);
  margin-bottom: 10px;
}

.dv-bar-chart {
  display: flex;
  align-items: flex-end;
  height: 120px;
  gap: 3px;
}

.dv-bar {
  border-radius: 3px 3px 0 0;
  min-width: 12px;
  transition: height 0.3s;
}

.dv-labels {
  display: flex;
  justify-content: space-around;
  margin-top: 6px;
  font-size: 9px;
  color: var(--text-tertiary);
}

.dv-pie {
  width: 100px;
  height: 100px;
  display: block;
  margin: 0 auto 8px;
}

.dv-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
}

.dv-legend-item {
  font-size: 10px;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 4px;
}

.dv-legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dv-line-svg {
  width: 100%;
  height: 100px;
}

@media (max-width: 640px) {
  .dv-charts {
    grid-template-columns: 1fr;
  }
}
</style>
