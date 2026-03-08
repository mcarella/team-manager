import type { PeerCVFAssessment, PeerCVFSummary, CVFScores } from '@team-manager/shared'

export function aggregatePeerCVFAssessments(
  subjectId: string,
  assessments: PeerCVFAssessment[],
): PeerCVFSummary {
  // Filter to subject, upsert by assessorId (last wins)
  const byAssessor = new Map<string, PeerCVFAssessment>()
  for (const a of assessments) {
    if (a.subjectId === subjectId) byAssessor.set(a.assessorId, a)
  }

  const unique = Array.from(byAssessor.values())
  const totalEvaluators = unique.length

  if (totalEvaluators === 0) {
    return { subjectId, results: { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }, totalEvaluators: 0 }
  }

  const sums: CVFScores = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
  for (const a of unique) {
    sums.clan      += a.results.clan
    sums.adhocracy += a.results.adhocracy
    sums.market    += a.results.market
    sums.hierarchy += a.results.hierarchy
  }

  return {
    subjectId,
    results: {
      clan:      sums.clan      / totalEvaluators,
      adhocracy: sums.adhocracy / totalEvaluators,
      market:    sums.market    / totalEvaluators,
      hierarchy: sums.hierarchy / totalEvaluators,
    },
    totalEvaluators,
  }
}
