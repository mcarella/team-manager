import { describe, it, expect } from 'vitest'
import type { BehavioralCoreFactors } from '@team-manager/shared'
import {
  computeBehavioralCoreFactors,
  synthesizeFactors,
  computeGolemanRadar,
  matchSubProfile,
} from './behavioral-core.js'
import { ADJECTIVES } from './data/adjectives.js'
import { SUB_PROFILES } from './data/sub-profiles.js'

describe('computeBehavioralCoreFactors', () => {
  it('returns near-neutral (40-55) for each factor when no adjectives are selected', () => {
    const factors = computeBehavioralCoreFactors([])
    expect(factors.dominance).toBeGreaterThanOrEqual(40)
    expect(factors.dominance).toBeLessThanOrEqual(55)
    expect(factors.extraversion).toBeGreaterThanOrEqual(40)
    expect(factors.extraversion).toBeLessThanOrEqual(55)
    expect(factors.patience).toBeGreaterThanOrEqual(40)
    expect(factors.patience).toBeLessThanOrEqual(55)
    expect(factors.formality).toBeGreaterThanOrEqual(40)
    expect(factors.formality).toBeLessThanOrEqual(55)
  })

  it('returns 100 on the targeted factor when all positive-weight adjectives for that factor are selected', () => {
    const highDominance = ADJECTIVES.filter(a => a.factor === 'dominance' && a.weight > 0).map(a => a.id)
    const factors = computeBehavioralCoreFactors(highDominance)
    expect(factors.dominance).toBeCloseTo(100, 4)
  })

  it('returns 0 on the targeted factor when all negative-weight adjectives for that factor are selected', () => {
    const lowFormality = ADJECTIVES.filter(a => a.factor === 'formality' && a.weight < 0).map(a => a.id)
    const factors = computeBehavioralCoreFactors(lowFormality)
    expect(factors.formality).toBeCloseTo(0, 4)
  })

  it('ignores unknown adjective IDs without throwing', () => {
    expect(() => computeBehavioralCoreFactors(['not-an-id', 'a01'])).not.toThrow()
  })

  it('ignores objectivity-factor adjectives (factor E is not exposed on BehavioralCoreFactors)', () => {
    const eAdjectives = ADJECTIVES.filter(a => a.factor === 'objectivity').map(a => a.id)
    const factors = computeBehavioralCoreFactors(eAdjectives)
    const empty = computeBehavioralCoreFactors([])
    // Objectivity selections do not move the 4 core factors.
    expect(factors.dominance).toBe(empty.dominance)
    expect(factors.extraversion).toBe(empty.extraversion)
    expect(factors.patience).toBe(empty.patience)
    expect(factors.formality).toBe(empty.formality)
  })
})

describe('synthesizeFactors', () => {
  const FACTORS_A: BehavioralCoreFactors = { dominance: 0,   extraversion: 0,   patience: 0,   formality: 0   }
  const FACTORS_B: BehavioralCoreFactors = { dominance: 100, extraversion: 100, patience: 100, formality: 100 }

  it('returns the same factors when selfConcept equals self', () => {
    const mid: BehavioralCoreFactors = { dominance: 50, extraversion: 50, patience: 50, formality: 50 }
    expect(synthesizeFactors(mid, mid)).toEqual(mid)
  })

  it('weights Self at 0.6 and Self-Concept at 0.4', () => {
    // self = 100, selfConcept = 0 → 0.6 * 100 + 0.4 * 0 = 60
    const result = synthesizeFactors(FACTORS_A, FACTORS_B)
    expect(result.dominance).toBeCloseTo(60, 4)
    expect(result.extraversion).toBeCloseTo(60, 4)
    expect(result.patience).toBeCloseTo(60, 4)
    expect(result.formality).toBeCloseTo(60, 4)
  })

  it('weights inverse: self=0, selfConcept=100 → 40', () => {
    const result = synthesizeFactors(FACTORS_B, FACTORS_A)
    expect(result.dominance).toBeCloseTo(40, 4)
  })
})

describe('computeGolemanRadar', () => {
  const BALANCED: BehavioralCoreFactors = { dominance: 50, extraversion: 50, patience: 50, formality: 50 }

  it('returns 50 across all 6 styles for fully balanced factors', () => {
    const radar = computeGolemanRadar(BALANCED)
    expect(radar.coercive).toBe(50)
    expect(radar.authoritative).toBe(50)
    expect(radar.pacesetting).toBe(50)
    expect(radar.democratic).toBe(50)
    expect(radar.coaching).toBe(50)
    expect(radar.visionary).toBe(50)
  })

  it('maxes Coercive when high-dominance + low-extraversion + high-formality', () => {
    const radar = computeGolemanRadar({ dominance: 100, extraversion: 0, patience: 50, formality: 100 })
    expect(radar.coercive).toBe(100)
  })

  it('maxes Coaching when low-dominance + high-patience + high-formality', () => {
    const radar = computeGolemanRadar({ dominance: 0, extraversion: 50, patience: 100, formality: 100 })
    expect(radar.coaching).toBe(100)
  })

  it('maxes Visionary when high-dominance + high-extraversion + low-formality', () => {
    const radar = computeGolemanRadar({ dominance: 100, extraversion: 100, patience: 50, formality: 0 })
    expect(radar.visionary).toBe(100)
  })

  it('returns each style in [0, 100] for any valid input', () => {
    const radar = computeGolemanRadar({ dominance: 73, extraversion: 41, patience: 18, formality: 92 })
    for (const score of Object.values(radar)) {
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    }
  })
})

describe('matchSubProfile', () => {
  it('matches camaleonte for perfectly balanced factors (50/50/50/50)', () => {
    expect(matchSubProfile({ dominance: 50, extraversion: 50, patience: 50, formality: 50 })).toBe('camaleonte')
  })

  it('matches direttore for high-dom + low-extra + low-pat + high-form (80/20/20/80)', () => {
    expect(matchSubProfile({ dominance: 80, extraversion: 20, patience: 20, formality: 80 })).toBe('direttore')
  })

  it('matches guardiano for low-dom + low-extra + high-pat + high-form (20/25/80/85)', () => {
    expect(matchSubProfile({ dominance: 20, extraversion: 25, patience: 80, formality: 85 })).toBe('guardiano')
  })

  it('matches capitano for high-dom + high-extra + low-pat + low-form (80/80/20/30)', () => {
    expect(matchSubProfile({ dominance: 80, extraversion: 80, patience: 20, formality: 30 })).toBe('capitano')
  })

  it('round-trips every sub-profile centroid (each centroid maps back to its own id)', () => {
    // Catches centroid collisions and verifies that every profile is reachable.
    for (const profile of SUB_PROFILES) {
      expect(matchSubProfile(profile.centroid)).toBe(profile.id)
    }
  })

  it('excludes camaleonte when even one factor deviates beyond ±10 from 50', () => {
    // High formality but otherwise neutral — must NOT collapse to camaleonte.
    expect(matchSubProfile({ dominance: 50, extraversion: 50, patience: 50, formality: 70 })).not.toBe('camaleonte')
  })

  it('still matches camaleonte for inputs within the balanced band (e.g., 45/55/52/48)', () => {
    expect(matchSubProfile({ dominance: 45, extraversion: 55, patience: 52, formality: 48 })).toBe('camaleonte')
  })

  it('excludes camaleonte for moderate-but-asymmetric inputs (e.g., low-dom + high-extra)', () => {
    expect(matchSubProfile({ dominance: 35, extraversion: 65, patience: 50, formality: 50 })).not.toBe('camaleonte')
  })
})
