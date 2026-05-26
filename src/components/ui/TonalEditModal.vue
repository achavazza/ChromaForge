<template>
  <ColorModal
    v-if="modelValue"
    :visible="!!modelValue"
    :color="modelValue"
    mode="edit"
    :show-roles="true"
    @close="emit('close')"
    @update:hex="(hex) => emit('update', hex)"
    @clone="emit('clone')"
    @remove="emit('remove')"
  />
</template>

<script setup lang="ts">
import type { ColorEntry } from '../../stores/palette'
import ColorModal from './ColorModal.vue'

defineProps<{
  modelValue: ColorEntry | null
}>()

const emit = defineEmits<{
  close: []
  update: [hex: string]
  clone: []
  remove: []
}>()
</script>
