import type { WorkspaceDefinition, WorkspaceId, AnalysisFactory } from './types'
import { createUIAnalysis } from './ui-design/index'
import { createDataVizAnalysis } from './data-viz/index'
import { createAccessibilityAnalysis } from './accessibility/index'
import { createBrandingAnalysis } from './branding/index'

export const WORKSPACE_DEFINITIONS: WorkspaceDefinition[] = [
  {
    id: 'ui-design',
    name: 'UI Design System',
    description: 'Build design systems, websites, dashboards and applications.',
    detail: 'Focus on semantic colors, surfaces, text colors, accessibility and design tokens.',
    focus: ['semantic colors', 'surfaces', 'text colors', 'accessibility', 'design tokens'],
  },
  {
    id: 'data-viz',
    name: 'Data Visualization',
    description: 'Build palettes for charts, dashboards and category distinction.',
    detail: 'Focus on category separation, color blindness safety, distinguishability and chart usability.',
    focus: ['category separation', 'color blindness safety', 'distinguishability', 'chart usability'],
  },
  {
    id: 'accessibility',
    name: 'Accessibility Audit',
    description: 'Evaluate contrast, readability and accessibility compliance.',
    detail: 'Focus on WCAG, APCA, color blindness and readability.',
    focus: ['WCAG', 'APCA', 'color blindness', 'readability'],
  },
  {
    id: 'branding',
    name: 'Branding & Marketing',
    description: 'Evaluate emotional consistency and brand cohesion.',
    detail: 'Focus on visual identity, emotional tone, personality and consistency.',
    focus: ['visual identity', 'emotional tone', 'personality', 'consistency'],
  },
]

const analysisFactories: Record<WorkspaceId, AnalysisFactory> = {
  'ui-design': createUIAnalysis,
  'data-viz': createDataVizAnalysis,
  'accessibility': createAccessibilityAnalysis,
  'branding': createBrandingAnalysis,
}

export function getWorkspaceAnalysis(id: WorkspaceId): AnalysisFactory {
  return analysisFactories[id]
}

export function getWorkspaceDefinition(id: WorkspaceId): WorkspaceDefinition {
  return WORKSPACE_DEFINITIONS.find(w => w.id === id)!
}
