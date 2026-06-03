<template>
  <PalettePreviewUI :colors="colors" :full="full" :label="label" />
</template>

<script setup lang="ts">
import PalettePreviewUI from '../PalettePreviewUI.vue'

defineProps<{
  colors: { hex: string }[]
  full?: boolean
  label?: string
}>()
</script>
