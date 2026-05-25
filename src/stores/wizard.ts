import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface WizardStep {
  id: number
  title: string
  description: string
  icon: string
  completed: boolean
}

export const useWizardStore = defineStore('wizard', () => {
  const currentStep = ref(1)
  const steps = ref<WizardStep[]>([
    { id: 1, title: 'Palette Builder', description: 'Create your color palette', icon: 'palette', completed: false },
    { id: 2, title: 'Naming & Tokens', description: 'Semantic refinement', icon: 'tag', completed: false },
    { id: 3, title: 'Analysis', description: 'Smart suggestions & health', icon: 'sparkles', completed: false },
    { id: 4, title: 'Contrast & WCAG', description: 'Accessibility testing', icon: 'shield', completed: false },
    { id: 5, title: 'Preview & Export', description: 'Live preview & export', icon: 'eye', completed: false },
  ])

  function goTo(stepId: number) {
    const prev = steps.value.find(s => s.id === currentStep.value)
    if (prev && stepId > currentStep.value) prev.completed = true
    currentStep.value = stepId
  }

  function next() {
    if (currentStep.value < 5) {
      const step = steps.value.find(s => s.id === currentStep.value)
      if (step) step.completed = true
      currentStep.value++
    }
  }

  function prev() {
    if (currentStep.value > 1) currentStep.value--
  }

  return { currentStep, steps, goTo, next, prev }
})
