import type {
  BehavioralCoreFactors,
  BehavioralCoreSubProfile,
  GolemanRadar,
} from '@team-manager/shared'
import { ADJECTIVES, type Factor } from './data/adjectives.js'
import { SUB_PROFILES } from './data/sub-profiles.js'

type CoreFactorKey = keyof BehavioralCoreFactors

const CORE_FACTORS: readonly CoreFactorKey[] = ['dominance', 'extraversion', 'patience', 'formality']

/**
 * Compute the 4 Behavioral Core factors from a set of selected adjective IDs.
 *
 * Each selected adjective contributes its signed weight to its factor.
 * Per-factor raw sum is then mapped to 0-100 via
 *   normalized = ((raw - negSum) / (posSum - negSum)) * 100
 * where posSum/negSum are the sum of positive/negative weights in the factor's bank.
 *
 * Source: docs/references/index/assessment-mock.jsx lines 162-185.
 * Factor E (objectivity) is computed but intentionally NOT exposed on
 * BehavioralCoreFactors for v1 — it does not drive sub-profile matching.
 */
export function computeBehavioralCoreFactors(selectedIds: string[]): BehavioralCoreFactors {
  const sums: Record<CoreFactorKey, number> = { dominance: 0, extraversion: 0, patience: 0, formality: 0 }
  for (const id of selectedIds) {
    const adj = ADJECTIVES.find(a => a.id === id)
    if (!adj || !isCoreFactor(adj.factor)) continue
    sums[adj.factor] += adj.weight
  }
  return {
    dominance:    normalizeFactor(sums.dominance,    'dominance'),
    extraversion: normalizeFactor(sums.extraversion, 'extraversion'),
    patience:     normalizeFactor(sums.patience,     'patience'),
    formality:    normalizeFactor(sums.formality,    'formality'),
  }
}

function isCoreFactor(f: Factor): f is CoreFactorKey {
  return (CORE_FACTORS as readonly Factor[]).includes(f)
}

function normalizeFactor(raw: number, factor: CoreFactorKey): number {
  let posSum = 0
  let negSum = 0
  for (const a of ADJECTIVES) {
    if (a.factor !== factor) continue
    if (a.weight > 0) posSum += a.weight
    else if (a.weight < 0) negSum += a.weight
  }
  const range = posSum - negSum
  if (range === 0) return 50
  const normalized = ((raw - negSum) / range) * 100
  return Math.max(0, Math.min(100, normalized))
}

/**
 * Weighted blend of the two assessment passes:
 * Self (who you really are) carries 60%, Self-Concept (how others expect
 * you to be) carries 40%. Reference: assessment-mock.jsx line 187.
 */
export function synthesizeFactors(
  selfConcept: BehavioralCoreFactors,
  self: BehavioralCoreFactors,
): BehavioralCoreFactors {
  return {
    dominance:    self.dominance    * 0.6 + selfConcept.dominance    * 0.4,
    extraversion: self.extraversion * 0.6 + selfConcept.extraversion * 0.4,
    patience:     self.patience     * 0.6 + selfConcept.patience     * 0.4,
    formality:    self.formality    * 0.6 + selfConcept.formality    * 0.4,
  }
}

/**
 * Compute the 6-axis Goleman radar from the 4 Behavioral Core factors.
 * Rules per docs/ideas/leadership-profile-expansion.md §3.
 *
 * DESIGN-Q: single-vs-distribution — this returns the full distribution.
 * UI may project to a dominant style via Math.max if a single headline is desired.
 */
export function computeGolemanRadar(f: BehavioralCoreFactors): GolemanRadar {
  return {
    coercive:      avg3(f.dominance,        100 - f.extraversion, f.formality),
    authoritative: avg3(f.dominance,        f.extraversion,       100 - f.patience),
    democratic:    avg3(100 - f.dominance,  f.extraversion,       f.patience),
    pacesetting:   avg3(f.dominance,        100 - f.extraversion, 100 - f.patience),
    coaching:      avg3(100 - f.dominance,  f.patience,           f.formality),
    visionary:     avg3(f.dominance,        f.extraversion,       100 - f.formality),
  }
}

function avg3(a: number, b: number, c: number): number {
  return (a + b + c) / 3
}

/**
 * Nearest-centroid match against the 17 sub-profile centroids.
 * Euclidean distance in 4-factor space. Ties broken by alphabetical id.
 *
 * Special case: the `camaleonte` (Adapter) centroid sits at (50/50/50/50) —
 * the dead center of factor space. Without protection, every undifferentiated
 * or moderate selection lands closest to it, swallowing real signal. So we
 * exclude camaleonte from the candidate set unless the user is *genuinely*
 * balanced: every factor within ±10 of 50.
 */
const BALANCED_THRESHOLD = 10

export function matchSubProfile(f: BehavioralCoreFactors): BehavioralCoreSubProfile {
  const isBalanced = CORE_FACTORS.every(k => Math.abs(f[k] - 50) <= BALANCED_THRESHOLD)

  let best: typeof SUB_PROFILES[number] | null = null
  let bestDist = Infinity
  for (const p of SUB_PROFILES) {
    if (!isBalanced && p.id === 'camaleonte') continue
    const d = squaredDistance(f, p.centroid)
    if (best === null || d < bestDist || (d === bestDist && p.id < best.id)) {
      best = p
      bestDist = d
    }
  }
  return best!.id
}

function squaredDistance(a: BehavioralCoreFactors, b: BehavioralCoreFactors): number {
  const dD = a.dominance - b.dominance
  const dE = a.extraversion - b.extraversion
  const dP = a.patience - b.patience
  const dF = a.formality - b.formality
  return dD * dD + dE * dE + dP * dP + dF * dF
}
