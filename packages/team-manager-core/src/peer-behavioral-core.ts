import type {
  PeerBehavioralCoreAssessment,
  PeerBehavioralCoreSummary,
  BehavioralCoreFactors,
  AdjectiveFrequency,
} from '@team-manager/shared'
import { matchSubProfile } from './behavioral-core.js'
import { ADJECTIVES } from './data/adjectives.js'

const NEUTRAL_FACTORS: BehavioralCoreFactors = {
  dominance: 50,
  extraversion: 50,
  patience: 50,
  formality: 50,
}

/**
 * Aggregate peer Layer-2 (Behavioral Core) assessments for one subject.
 * Mirrors the shape of aggregatePeerLeadershipAssessments (Layer 1):
 *  - upsert by assessorId (last submission wins)
 *  - average the per-peer factor scores
 *  - count sub-profile occurrences across peers
 *  - build an adjective-frequency map for the heatmap
 *  - run `matchSubProfile` on the averaged factors to pick a peer-perceived
 *    sub-profile for the subject
 */
export function aggregatePeerBehavioralCoreAssessments(
  subjectId: string,
  assessments: PeerBehavioralCoreAssessment[],
): PeerBehavioralCoreSummary {
  const byAssessor = new Map<string, PeerBehavioralCoreAssessment>()
  for (const a of assessments) {
    if (a.subjectId === subjectId) byAssessor.set(a.assessorId, a)
  }
  const unique = [...byAssessor.values()]
  const totalEvaluators = unique.length

  if (totalEvaluators === 0) {
    return {
      subjectId,
      totalEvaluators: 0,
      adjectiveFrequency: {},
      factors: { ...NEUTRAL_FACTORS },
      subProfile: null,
      subProfileCounts: {},
    }
  }

  const adjectiveFrequency: Record<string, number> = {}
  const sums = { dominance: 0, extraversion: 0, patience: 0, formality: 0 }
  const subProfileCounts: Record<string, number> = {}

  for (const a of unique) {
    for (const pickId of a.picks) {
      adjectiveFrequency[pickId] = (adjectiveFrequency[pickId] ?? 0) + 1
    }
    sums.dominance    += a.factors.dominance
    sums.extraversion += a.factors.extraversion
    sums.patience     += a.factors.patience
    sums.formality    += a.factors.formality
    subProfileCounts[a.subProfile] = (subProfileCounts[a.subProfile] ?? 0) + 1
  }

  const factors: BehavioralCoreFactors = {
    dominance:    sums.dominance    / totalEvaluators,
    extraversion: sums.extraversion / totalEvaluators,
    patience:     sums.patience     / totalEvaluators,
    formality:    sums.formality    / totalEvaluators,
  }

  return {
    subjectId,
    totalEvaluators,
    adjectiveFrequency,
    factors,
    subProfile: matchSubProfile(factors),
    subProfileCounts,
  }
}

/**
 * Turn the adjective frequency map into the top-N entries (sorted desc),
 * enriched with each adjective's factor + weight from the instrument bank.
 * Unknown IDs are silently dropped. Used as input to <AdjectiveTreemap />.
 */
export function computeAdjectiveCloud(
  summary: PeerBehavioralCoreSummary,
  topN = 30,
): AdjectiveFrequency[] {
  const enriched: AdjectiveFrequency[] = []
  for (const [id, count] of Object.entries(summary.adjectiveFrequency)) {
    const adj = ADJECTIVES.find(a => a.id === id)
    if (!adj) continue
    enriched.push({
      adjectiveId: id,
      count,
      factor: adj.factor,
      weight: adj.weight,
    })
  }
  enriched.sort((a, b) => b.count - a.count)
  return enriched.slice(0, topN)
}
