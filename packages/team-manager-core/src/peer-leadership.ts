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

export type BehaviorDeltaClassification = 'aligned' | 'hidden' | 'blind'

export interface BehaviorDelta {
  behavior: BehaviorKey
  self: number
  peer: number
  /** peer - self. Positive = peers see more than you, negative = peers see less. */
  delta: number
  classification: BehaviorDeltaClassification
}

const DELTA_THRESHOLD = 2

/**
 * Compare a user's self leadership scores against their peer-summary averages.
 * Returns one entry per behavior with delta + classification:
 *  - `aligned`  when |delta| ≤ 2 (peers and self roughly agree)
 *  - `hidden`   when delta > 2  (peers see MORE than self — a hidden strength)
 *  - `blind`    when delta < -2 (peers see LESS than self — a blind spot)
 *
 * Returns `[]` when no peers have evaluated the subject yet.
 */
export function computeBehaviorDeltas(
  self: LeadershipScores,
  peer: PeerLeadershipSummary,
): BehaviorDelta[] {
  if (peer.totalEvaluators === 0) return []
  return BEHAVIORS.map(b => {
    const selfScore = self[b]
    const peerScore = peer.behaviors[b].average
    const delta = peerScore - selfScore
    const classification: BehaviorDeltaClassification =
      Math.abs(delta) <= DELTA_THRESHOLD ? 'aligned' :
      delta > 0 ? 'hidden' : 'blind'
    return { behavior: b, self: selfScore, peer: peerScore, delta, classification }
  })
}
