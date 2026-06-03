import { computed } from 'vue'
import type { ColorEntry, ContrastPair, SemanticRole } from '../../stores/palette'
import type { AnalysisFactory, PaletteInsight, PaletteIssue, Suggestion, WorkspaceScores, ColorRefinement, InsightGroup } from '../types'
import { usePaletteAnalysis, type Suggestion as LegacySuggestion, type PaletteIssue as LegacyIssue } from '../../composables/usePaletteAnalysis'
import { useAdvancedAnalysis, type PaletteInsight as LegacyInsight, type ColorRefinement as LegacyRefinement } from '../../composables/useAdvancedAnalysis'

function mapLegacyIssue(l: LegacyIssue): PaletteIssue {
  return {
    id: l.id,
    severity: l.severity as PaletteIssue['severity'],
    title: l.title,
    description: l.description,
    suggestion: l.suggestion,
    affectedIds: l.affectedIds,
    quickFix: l.quickFix ? { label: 'Fix', action: l.quickFix } : undefined,
  }
}

function mapLegacySuggestion(s: LegacySuggestion): Suggestion {
  return {
    id: s.id,
    hex: s.hex,
    role: s.role as SemanticRole,
    title: s.title,
    explanation: s.explanation,
    accessibilityImpact: s.accessibilityImpact,
    baseHex: s.baseHex,
  }
}

function mapLegacyInsight(l: LegacyInsight): PaletteInsight {
  return {
    id: l.id,
    severity: l.severity as PaletteInsight['severity'],
    category: l.category,
    title: l.title,
    description: l.description,
  }
}

function mapLegacyRefinement(r: LegacyRefinement): ColorRefinement {
  return {
    colorId: r.colorId,
    currentHex: r.currentHex,
    suggestedHex: r.suggestedHex,
    title: r.title,
    explanation: r.explanation,
    rationale: r.rationale,
    huePreserved: r.huePreserved,
    chromaReduction: r.chromaReduction,
  }
}

export const createUIAnalysis: AnalysisFactory = (
  colorsGetter: () => ColorEntry[],
  isDark: () => boolean,
  contrastPairsGetter: () => ContrastPair[]
) => {
  const legacy = usePaletteAnalysis(colorsGetter, isDark, contrastPairsGetter)
  const advanced = useAdvancedAnalysis(colorsGetter, isDark, contrastPairsGetter)

  const insights = computed<PaletteInsight[]>(() => advanced.insights.value.map(mapLegacyInsight))
  const issues = computed<PaletteIssue[]>(() => legacy.issues.value.map(mapLegacyIssue))
  const suggestions = computed<Suggestion[]>(() => legacy.suggestions.value.map(mapLegacySuggestion))
  const scores = computed<WorkspaceScores>(() => ({ ...advanced.scores.value }))
  const refinements = computed<ColorRefinement[]>(() => advanced.refinements.value.map(mapLegacyRefinement))
  const insightGroups = computed<InsightGroup[]>(() => advanced.insightGroups.value as InsightGroup[])
  const topIssues = computed<PaletteInsight[]>(() => advanced.topIssues.value as PaletteInsight[])
  const healthScore = computed<number>(() => legacy.healthScore.value)

  return {
    insights,
    issues,
    suggestions,
    scores,
    refinements,
    insightGroups,
    topIssues,
    healthScore,
    cycleRefinement: advanced.cycleRefinement,
    regenerateSuggestion: legacy.regenerateSuggestion,
  }
}
