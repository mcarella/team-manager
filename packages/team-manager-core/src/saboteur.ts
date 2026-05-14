import type {
  LikertValue,
  SaboteurId,
  SaboteurScores,
  SagePowerId,
  PQInterpretation,
} from '@team-manager/shared'
import { SABOTEUR_QUESTIONS } from './data/saboteur-questions.js'
import { ALL_SABOTEUR_IDS, getSaboteurProfile } from './data/saboteurs.js'

/**
 * Compute 0-10 saboteur scores from 50 Likert answers (1-5 each).
 *
 * For each saboteur:
 *   - take all items tagged with that saboteurId
 *   - apply reverse-scoring if flagged (answer → 6 - answer)
 *   - take the weighted mean (1-5 range)
 *   - normalize to 0-10: ((mean - 1) / 4) × 10
 *   - round to 1 decimal place
 *
 * Throws if `answers.length` does not match the question bank.
 */
export function computeSaboteurScores(answers: LikertValue[]): SaboteurScores {
  if (answers.length !== SABOTEUR_QUESTIONS.length) {
    throw new Error(
      `Expected ${SABOTEUR_QUESTIONS.length} answers, got ${answers.length}`,
    )
  }

  const sums: Record<string, number> = {}
  const weights: Record<string, number> = {}
  for (const id of ALL_SABOTEUR_IDS) {
    sums[id] = 0
    weights[id] = 0
  }

  SABOTEUR_QUESTIONS.forEach((q, i) => {
    const raw = answers[i]!
    const scored = q.reverseScored ? 6 - raw : raw
    sums[q.saboteurId] = (sums[q.saboteurId] ?? 0) + scored * q.weight
    weights[q.saboteurId] = (weights[q.saboteurId] ?? 0) + q.weight
  })

  const result = {} as SaboteurScores
  for (const id of ALL_SABOTEUR_IDS) {
    const w = weights[id]!
    if (w === 0) {
      result[id] = 0
      continue
    }
    const mean = sums[id]! / w
    const normalized = ((mean - 1) / 4) * 10
    result[id] = Math.round(normalized * 10) / 10
  }
  return result
}

/**
 * Compute the PQ (Positive Intelligence) score from 24 emotion pairs.
 * Each pair has a `pos` and a `neg` Likert (1-5). PQ = totalPos / (totalPos + totalNeg) × 100.
 * Rounded to nearest integer (0-100).
 */
export function computePQScore(pairs: Array<{ pos: LikertValue; neg: LikertValue }>): number {
  if (pairs.length !== 24) {
    throw new Error(`Expected 24 PQ pairs, got ${pairs.length}`)
  }
  let totalPos = 0
  let totalNeg = 0
  for (const p of pairs) {
    totalPos += p.pos
    totalNeg += p.neg
  }
  const denom = totalPos + totalNeg
  if (denom === 0) return 50
  return Math.round((totalPos / denom) * 100)
}

/**
 * Map a 0-100 PQ score to an interpretation level.
 * Thresholds match the Shirzad Chamine "tipping point" at 75.
 */
export function interpretPQ(score: number): PQInterpretation {
  const buckets: Array<{ min: number; level: PQInterpretation['level']; color: string }> = [
    { min: 85, level: 'mastery',   color: '#059669' },
    { min: 75, level: 'excellent', color: '#10b981' },
    { min: 65, level: 'good',      color: '#f59e0b' },
    { min: 50, level: 'mixed',     color: '#f97316' },
    { min: 0,  level: 'critical',  color: '#ef4444' },
  ]
  const bucket = buckets.find(b => score >= b.min)!
  return {
    level: bucket.level,
    labelKey: `layer3:pq.levels.${bucket.level}.label`,
    descriptionKey: `layer3:pq.levels.${bucket.level}.description`,
    color: bucket.color,
  }
}

/**
 * Sort the 10 saboteurs by score descending. Ties broken by canonical
 * declaration order (`ALL_SABOTEUR_IDS`) — keeps output stable across runs.
 */
export function rankSaboteurs(scores: SaboteurScores): SaboteurId[] {
  return [...ALL_SABOTEUR_IDS].sort((a, b) => {
    const diff = scores[b] - scores[a]
    if (diff !== 0) return diff
    return ALL_SABOTEUR_IDS.indexOf(a) - ALL_SABOTEUR_IDS.indexOf(b)
  })
}

/**
 * Recommend up to 3 Sage Powers based on the top saboteurs.
 * Each saboteur contributes its antidotes weighted by rank (top1=3, top2=2, top3=1).
 * Output is sorted by total weight (descending); ties broken by sage-power
 * declaration order (`empathize, explore, innovate, navigate, activate`).
 */
export function recommendSagePowers(topSaboteurs: SaboteurId[]): SagePowerId[] {
  const weights = new Map<SagePowerId, number>()
  topSaboteurs.slice(0, 3).forEach((sabId, idx) => {
    const weight = 3 - idx
    const profile = getSaboteurProfile(sabId)
    for (const power of profile.sageAntidotes) {
      weights.set(power, (weights.get(power) ?? 0) + weight)
    }
  })
  return [...weights.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => id)
}
