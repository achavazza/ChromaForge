import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WorkspaceId } from '../workspaces/types'
import { getWorkspaceDefinition, WORKSPACE_DEFINITIONS } from '../workspaces/registry'

export const useWorkspaceStore = defineStore('workspace', () => {
  const activeWorkspace = ref<WorkspaceId | null>(null)

  const definition = computed(() =>
    activeWorkspace.value ? getWorkspaceDefinition(activeWorkspace.value) : null
  )

  const isSelected = computed(() => activeWorkspace.value !== null)

  const selectWorkspace = (id: WorkspaceId) => {
    activeWorkspace.value = id
  }

  const clearWorkspace = () => {
    activeWorkspace.value = null
  }

  return {
    activeWorkspace,
    definition,
    isSelected,
    selectWorkspace,
    clearWorkspace,
    allWorkspaces: WORKSPACE_DEFINITIONS,
  }
})
