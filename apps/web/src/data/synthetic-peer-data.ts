import type { BehavioralCoreAssessment, BehavioralCoreFactors } from '@team-manager/shared'
import { ADJECTIVES, SUB_PROFILES } from '@team-manager/core'

export type DivergenceMode = 'aligned' | 'mixed' | 'blindSpot'

export interface SyntheticPeerPick {
  assessorId: string
  subjectId: string
  picks: string[]
}

interface Options {
  divergence?: DivergenceMode
  /** Deterministic seed for reproducible output. */
  seed?: number
}

/**
 * Generate synthetic peer Layer-2 (Behavioral Core) assessments for a subject.
 *
 * When the subject has their own self-L2 result: each peer picks a noisy subset
 * of the subject's `self` picks, with divergence-controlled overlap:
 *  - aligned  → ~14 of 20 picks come from the subject's set
 *  - mixed    → ~10 of 20
 *  - blindSpot → ~6 of 20, plus noise biased toward factors the subject barely engaged with
 *
 * When the subject has no self-L2 yet: each peer is anchored on a randomly-chosen
 * sub-profile centroid and picks adjectives biased toward that centroid.
 *
 * Fully deterministic via the `seed` option — same inputs always produce the
 * same output. This matters for snapshot tests and stable demo data.
 */
export function generateSyntheticPeerBehavioralCore(
  subject: { id: string; behavioralCore?: BehavioralCoreAssessment | null | undefined },
  peerIds: string[],
  options: Options = {},
): SyntheticPeerPick[] {
  const seed = options.seed ?? 42
  const divergence = options.divergence ?? 'mixed'
  const baseSet = subject.behavioralCore?.answers.self ?? null

  return peerIds.map((peerId, i) => {
    // Per-peer seed mixes the global seed + index + peerId hash for variety.
    const peerSeed = seed + i * 1000 + hashString(peerId)
    const rng = mulberry32(peerSeed)
    const picks = baseSet
      ? noiseSubjectSet(baseSet, divergence, rng)
      : pickAroundCentroid(rng)
    return { assessorId: peerId, subjectId: subject.id, picks }
  })
}

// ── When subject HAS self-L2: noise their pick set ──────────────────────────

function noiseSubjectSet(baseSet: string[], divergence: DivergenceMode, rng: () => number): string[] {
  const target = 20
  // How many of the 20 come from the subject's own picks
  const fromBase = divergence === 'aligned' ? 14 : divergence === 'mixed' ? 10 : 6
  const noiseCount = target - fromBase

  const picks = new Set<string>()
  const shuffledBase = shuffle([...baseSet], rng)
  for (let i = 0; i < fromBase && i < shuffledBase.length; i++) {
    picks.add(shuffledBase[i]!)
  }

  // Noise pool depends on divergence
  let noisePool: string[]
  if (divergence === 'blindSpot') {
    // Pick adjectives in factors NOT well represented in baseSet
    const factorCounts = new Map<string, number>()
    for (const id of baseSet) {
      const adj = ADJECTIVES.find(a => a.id === id)
      if (adj) factorCounts.set(adj.factor, (factorCounts.get(adj.factor) ?? 0) + 1)
    }
    const weakFactors = (['dominance', 'extraversion', 'patience', 'formality'] as const)
      .filter(f => (factorCounts.get(f) ?? 0) < 2)
    noisePool = ADJECTIVES
      .filter(a => weakFactors.includes(a.factor as typeof weakFactors[number]))
      .map(a => a.id)
      .filter(id => !picks.has(id))
  } else {
    noisePool = ADJECTIVES
      .filter(a => a.factor !== 'objectivity')
      .map(a => a.id)
      .filter(id => !picks.has(id))
  }

  const shuffledNoise = shuffle(noisePool, rng)
  for (let i = 0; i < noiseCount && i < shuffledNoise.length; i++) {
    picks.add(shuffledNoise[i]!)
  }

  return [...picks]
}

// ── When subject has NO self-L2: anchor on a random sub-profile centroid ────

function pickAroundCentroid(rng: () => number): string[] {
  // Pick a random target centroid (excluding camaleonte which is neutral)
  const nonNeutral = SUB_PROFILES.filter(p => p.id !== 'camaleonte')
  const target = nonNeutral[Math.floor(rng() * nonNeutral.length)]!
  return pickAdjectivesForFactors(target.centroid, 20, rng)
}

function pickAdjectivesForFactors(
  centroid: BehavioralCoreFactors,
  count: number,
  rng: () => number,
): string[] {
  // Score each adjective by how much its (factor, weight) pulls toward the centroid.
  // Fit = (centroidValue - 50) * weight — positive when adjective direction matches.
  type Scored = { id: string; fit: number }
  const scored: Scored[] = []
  for (const adj of ADJECTIVES) {
    if (adj.factor === 'objectivity') continue
    const centroidValue = centroid[adj.factor as keyof BehavioralCoreFactors]
    const fit = (centroidValue - 50) * adj.weight + (rng() - 0.5) * 30 // small jitter for variety
    scored.push({ id: adj.id, fit })
  }
  scored.sort((a, b) => b.fit - a.fit)
  return scored.slice(0, count).map(s => s.id)
}

// ── PRNG + helpers ──────────────────────────────────────────────────────────

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function mulberry32(seed: number): () => number {
  let s = seed | 0
  return () => {
    s = (s + 0x6D2B79F5) | 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0
  }
  return h
}
