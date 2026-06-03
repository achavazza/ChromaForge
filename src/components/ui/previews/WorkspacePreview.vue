<template>
  <UIDesignPreview v-if="ws.id === 'ui-design'" :colors="colors" :full="full" />
  <DataVizPreview v-else-if="ws.id === 'data-viz'" />
  <AccessibilityPreview v-else-if="ws.id === 'accessibility'" />
  <BrandingPreview v-else-if="ws.id === 'branding'" />
  <div v-else class="wp-empty">Select a workspace to preview</div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWorkspaceStore } from '../../../stores/workspace'
import UIDesignPreview from './UIDesignPreview.vue'
import DataVizPreview from './DataVizPreview.vue'
import AccessibilityPreview from './AccessibilityPreview.vue'
import BrandingPreview from './BrandingPreview.vue'

defineProps<{
  colors: { hex: string }[]
  full?: boolean
}>()

const ws = computed(() => useWorkspaceStore().definition || { id: '' })
</script>

<style scoped>
.wp-empty {
  padding: 40px;
  text-align: center;
  color: var(--text-tertiary);
  font-size: 13px;
}
</style>
