import type { ColorEntry, ContrastPair, SemanticRole } from '../stores/palette'

export type WorkspaceId = 'ui-design' | 'data-viz' | 'accessibility' | 'branding'

export interface WorkspaceDefinition {
  id: WorkspaceId
  name: string
  description: string
  detail: string
  focus: string[]
}

export interface WorkspaceAnalysisResult {
  insights: import('vue').ComputedRef<PaletteInsight[]>
  issues: import('vue').ComputedRef<PaletteIssue[]>
  suggestions: import('vue').ComputedRef<Suggestion[]>
  scores: import('vue').ComputedRef<WorkspaceScores>
  refinements: import('vue').ComputedRef<ColorRefinement[]>
  insightGroups: import('vue').ComputedRef<InsightGroup[]>
  topIssues: import('vue').ComputedRef<PaletteInsight[]>
  healthScore: import('vue').ComputedRef<number>
}

export interface PaletteInsight {
  id: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  category: string
  title: string
  description: string
  affectedIds?: string[]
  quickFix?: { label: string; action: () => void }
}

export interface PaletteIssue {
  id: string
  severity: 'critical' | 'warning' | 'info'
  title: string
  description: string
  suggestion?: string
  affectedIds?: string[]
  quickFix?: { label: string; action: () => void }
}

export interface Suggestion {
  id: string
  hex: string
  role: SemanticRole
  title: string
  explanation: string
  accessibilityImpact?: string
  baseHex?: string
}

export interface WorkspaceScores {
  practicality: number
  cohesion: number
  fatigue: number
}

export interface ColorRefinement {
  colorId: string
  currentHex: string
  suggestedHex: string
  title: string
  explanation: string
  rationale: string
  huePreserved: boolean
  chromaReduction: number
}

export interface InsightGroup {
  label: string
  key: string
  insights: PaletteInsight[]
}

export type AnalysisFactory = (
  colorsGetter: () => ColorEntry[],
  isDark: () => boolean,
  contrastPairsGetter: () => ContrastPair[]
) => WorkspaceAnalysisResult & {
  cycleRefinement: (colorId: string) => void
  regenerateSuggestion: (id: string) => void
}
