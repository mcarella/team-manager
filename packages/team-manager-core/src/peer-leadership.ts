import type { PeerLeadershipAssessment, PeerLeadershipSummary, Archetype, LeadershipScores } from '@team-manager/shared'

type BehaviorKey = keyof LeadershipScores

const BEHAVIORS: BehaviorKey[] = ['catalyzing', 'envisioning', 'demanding', 'coaching', 'conducting', 'directing']

export function aggregatePeerLeadershipAssessments(
  subjectId: string,
  assessments: PeerLeadershipAssessment[],
): PeerLeadershipSummary {
  // Filter to subject, upsert by assessorId (last wins)
  const byAssessor = new Map<string, PeerLeadershipAssessment>()
  for (const a of assessments) {
    if (a.subjectId === subjectId) byAssessor.set(a.assessorId, a)
  }

  const unique = Array.from(byAssessor.values())
  const totalEvaluators = unique.length

  const sums: Record<BehaviorKey, number> = {
    catalyzing: 0, envisioning: 0, demanding: 0,
    coaching: 0, conducting: 0, directing: 0,
  }
  const archetypeCounts: Record<string, number> = {}

  for (const a of unique) {
    for (const b of BEHAVIORS) sums[b] += a.scores[b]
    archetypeCounts[a.archetype] = (archetypeCounts[a.archetype] ?? 0) + 1
  }

  const makeBehavior = (b: BehaviorKey) => ({
    average: totalEvaluators > 0 ? sums[b] / totalEvaluators : 0,
    count: totalEvaluators,
  })

  let dominantArchetype: Archetype | null = null
  if (totalEvaluators > 0) {
    const top = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])[0]
    if (top) dominantArchetype = top[0] as Archetype
  }

  return {
    subjectId,
    behaviors: {
      catalyzing:  makeBehavior('catalyzing'),
      envisioning: makeBehavior('envisioning'),
      demanding:   makeBehavior('demanding'),
      coaching:    makeBehavior('coaching'),
      conducting:  makeBehavior('conducting'),
      directing:   makeBehavior('directing'),
    },
    archetypeCounts,
    dominantArchetype,
    totalEvaluators,
  }
}
