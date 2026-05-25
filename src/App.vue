<template>
  <div class="app-shell" :class="{ dark: themeStore.isDark }">
    <AppSidebar />
    <main class="main-content">
      <WizardHeader />
      <div class="step-container">
        <Transition name="step" mode="out-in">
          <Step1PaletteBuilder v-if="wizard.currentStep === 1" key="step1" />
          <Step4Naming v-else-if="wizard.currentStep === 2" key="step2" />
          <Step2Analysis v-else-if="wizard.currentStep === 3" key="step3" />
          <Step3Contrast v-else-if="wizard.currentStep === 4" key="step4" />
          <Step5Export v-else-if="wizard.currentStep === 5" key="step5" />
        </Transition>
      </div>
    </main>
    <GlobalPaletteBar />
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useThemeStore } from './stores/theme'
import { useWizardStore } from './stores/wizard'
import { usePaletteStore, type SemanticRole } from './stores/palette'
import chroma from 'chroma-js'
import { generateName, isValidHex } from './composables/useColorUtils'
import AppSidebar from './components/layout/AppSidebar.vue'
import WizardHeader from './components/layout/WizardHeader.vue'
import GlobalPaletteBar from './components/layout/GlobalPaletteBar.vue'
import Step1PaletteBuilder from './components/steps/Step1PaletteBuilder.vue'
import Step2Analysis from './components/steps/Step2Analysis.vue'
import Step3Contrast from './components/steps/Step3Contrast.vue'
import Step4Naming from './components/steps/Step4Naming.vue'
import Step5Export from './components/steps/Step5Export.vue'

const themeStore = useThemeStore()
const wizard = useWizardStore()
const palette = usePaletteStore()


onMounted(() => {
  themeStore.init()
})

// Parse URL hash for palette on load
const initHash = window.location.hash.replace(/^#\/?/, '')
if (initHash) {
  const hexes = initHash.split('-').filter(h => isValidHex('#' + h))
  if (hexes.length) {
    palette.reorderColors([])
    palette.importColors(hexes.map(h => '#' + h))
  }
}

// Snapshot palette when leaving step 1 (the "Before" state)
watch(() => wizard.currentStep, (step, prevStep) => {
  if (prevStep === 1 && step > 1) {
    palette.snapshotOriginal()
  }
    // Auto-assign roles when entering step 4 (Naming)
  if (step === 4 && prevStep !== 4) {
    autoAssignRoles()
  }
})

// Sync URL hash with palette
watch(() => palette.colors, (cs) => {
  const hexes = cs.map(c => c.hex.replace('#', ''))
  if (hexes.length) {
    window.location.hash = hexes.join('-')
  } else {
    window.location.hash = ''
  }
  // Save to localStorage
  localStorage.setItem('chromaforge-current', JSON.stringify(cs.map(c => c.hex)))
}, { deep: true })

function autoAssignRoles() {
  const cs = palette.colors
  if (!cs.length) return

  const taken = new Set<SemanticRole>()
  cs.forEach(c => { c.roles.forEach(r => taken.add(r)) })

  const darkMode = themeStore.isDark

  function assignRole(colorId: string, role: SemanticRole) {
    if (taken.has(role)) return
    palette.updateColor(colorId, { roles: [role] })
    taken.add(role)
  }

  const unassigned = () => cs.filter(c => c.roles.length === 0)

  if (darkMode) {
    if (!taken.has('text-primary')) {
      const pool = unassigned()
      if (pool.length) {
        const lightest = pool.reduce((a, b) => chroma(a.hex).luminance() > chroma(b.hex).luminance() ? a : b)
        assignRole(lightest.id, 'text-primary')
      }
    }
    if (!taken.has('background')) {
      const pool = unassigned()
      if (pool.length) {
        const darkest = pool.reduce((a, b) => chroma(a.hex).luminance() < chroma(b.hex).luminance() ? a : b)
        assignRole(darkest.id, 'background')
      }
    }
    if (!taken.has('surface')) {
      const pool = unassigned()
      if (pool.length) {
        const sorted = [...pool].sort((a, b) => chroma(a.hex).luminance() - chroma(b.hex).luminance())
        assignRole(sorted[0].id, 'surface')
      }
    }
  } else {
    if (!taken.has('background')) {
      const pool = unassigned()
      if (pool.length) {
        const lightest = pool.reduce((a, b) => chroma(a.hex).luminance() > chroma(b.hex).luminance() ? a : b)
        assignRole(lightest.id, 'background')
      }
    }
    if (!taken.has('surface')) {
      const pool = unassigned()
      if (pool.length) {
        const sorted = [...pool].sort((a, b) => chroma(b.hex).luminance() - chroma(a.hex).luminance())
        assignRole(sorted[0].id, 'surface')
      }
    }
  }

  if (!taken.has('primary')) {
    const pool = unassigned()
    if (pool.length) {
      const mostSat = pool.reduce((a, b) => {
        const sa = chroma(a.hex).get('hsl.s')
        const sb = chroma(b.hex).get('hsl.s')
        return sa > sb ? a : b
      })
      assignRole(mostSat.id, 'primary')
    }
  }

  // Auto-name unnamed colors
  cs.filter(c => !c.name).forEach(c => {
    const name = generateName(c.hex, c.roles)
    if (name) palette.updateColor(c.id, { name })
  })
}
</script>

<style scoped>
.app-shell {
  display: flex;
  min-height: 100vh;
  background-color: var(--bg-base);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.main-content {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
}

  .step-container {
    flex: 1;
    overflow-y: auto;
    padding: 32px;
    padding-bottom: 96px;
  }

@media (max-width: 768px) {
  .main-content {
    margin-left: 0;
  }
  .step-container {
    padding: 16px;
    padding-bottom: 80px;
  }
}
</style>
