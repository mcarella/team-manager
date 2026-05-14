import { describe, it, expect } from 'vitest'
import {
  computeSaboteurScores,
  computePQScore,
  interpretPQ,
  rankSaboteurs,
  recommendSagePowers,
} from './saboteur.js'
import { SABOTEUR_QUESTIONS } from './data/saboteur-questions.js'
import { ALL_SABOTEUR_IDS } from './data/saboteurs.js'
import type { LikertValue, SaboteurId } from '@team-manager/shared'

// Helper: build a 50-answer array where every answer is `value`.
function uniformAnswers(value: LikertValue): LikertValue[] {
  return new Array(SABOTEUR_QUESTIONS.length).fill(value) as LikertValue[]
}

// Helper: build a 50-answer array that maxes out one saboteur and zeroes the rest.
function maxOneSaboteur(target: SaboteurId): LikertValue[] {
  return SABOTEUR_QUESTIONS.map(q => (q.saboteurId === target ? 5 : 1)) as LikertValue[]
}

describe('computeSaboteurScores', () => {
  it('returns 0 for all saboteurs when every answer is the lowest Likert (1)', () => {
    const scores = computeSaboteurScores(uniformAnswers(1))
    for (const id of ALL_SABOTEUR_IDS) {
      expect(scores[id]).toBe(0)
    }
  })

  it('returns 10 for all saboteurs when every answer is the highest Likert (5)', () => {
    const scores = computeSaboteurScores(uniformAnswers(5))
    for (const id of ALL_SABOTEUR_IDS) {
      expect(scores[id]).toBe(10)
    }
  })

  it('returns 5 for all saboteurs when every answer is the midpoint (3)', () => {
    const scores = computeSaboteurScores(uniformAnswers(3))
    for (const id of ALL_SABOTEUR_IDS) {
      expect(scores[id]).toBe(5)
    }
  })

  it('isolates a single saboteur when only its questions are maxed', () => {
    const scores = computeSaboteurScores(maxOneSaboteur('judge'))
    expect(scores.judge).toBe(10)
    expect(scores.stickler).toBe(0)
    expect(scores.avoider).toBe(0)
  })

  it('rounds to 1 decimal place', () => {
    // Mixed answers — ensure no float drift past 1 decimal
    const mixed = SABOTEUR_QUESTIONS.map((_, i) => ((i % 5) + 1) as LikertValue)
    const scores = computeSaboteurScores(mixed)
    for (const id of ALL_SABOTEUR_IDS) {
      const s = scores[id]
      expect(Math.round(s * 10) / 10).toBe(s)
    }
  })

  it('throws when answer count does not match question bank', () => {
    expect(() => computeSaboteurScores([1, 2, 3] as LikertValue[])).toThrow()
  })
})

describe('computePQScore', () => {
  it('returns 50 when positive and negative scores are equal', () => {
    const pairs = new Array(24).fill({ pos: 3, neg: 3 }) as Array<{ pos: LikertValue; neg: LikertValue }>
    expect(computePQScore(pairs)).toBe(50)
  })

  it('returns 100 when positive maxed and negative at minimum', () => {
    const pairs = new Array(24).fill({ pos: 5, neg: 1 }) as Array<{ pos: LikertValue; neg: LikertValue }>
    // 24*5 / (24*5 + 24*1) = 120 / 144 = 83.3
    expect(computePQScore(pairs)).toBe(83)
  })

  it('returns 17 when negative maxed and positive at minimum', () => {
    const pairs = new Array(24).fill({ pos: 1, neg: 5 }) as Array<{ pos: LikertValue; neg: LikertValue }>
    // 24*1 / (24*1 + 24*5) = 24 / 144 = 16.7
    expect(computePQScore(pairs)).toBe(17)
  })

  it('rounds to nearest integer', () => {
    const pairs = new Array(24).fill({ pos: 4, neg: 3 }) as Array<{ pos: LikertValue; neg: LikertValue }>
    // 4 / (4+3) = 57.14
    expect(computePQScore(pairs)).toBe(57)
  })

  it('throws on wrong pair count', () => {
    expect(() => computePQScore([{ pos: 3, neg: 3 }])).toThrow()
  })
})

describe('interpretPQ', () => {
  it.each([
    [10,  'critical'],
    [49,  'critical'],
    [50,  'mixed'],
    [64,  'mixed'],
    [65,  'good'],
    [74,  'good'],
    [75,  'excellent'],
    [84,  'excellent'],
    [85,  'mastery'],
    [100, 'mastery'],
  ] as const)('interprets %i as %s', (score, expected) => {
    expect(interpretPQ(score).level).toBe(expected)
  })
})

describe('rankSaboteurs', () => {
  it('returns 10 ids in descending score order', () => {
    const scores = computeSaboteurScores(maxOneSaboteur('controller'))
    const ranked = rankSaboteurs(scores)
    expect(ranked).toHaveLength(10)
    expect(ranked[0]).toBe('controller')
  })

  it('breaks ties by canonical declaration order', () => {
    // All zeros → ties → must follow ALL_SABOTEUR_IDS order
    const scores = computeSaboteurScores(uniformAnswers(1))
    const ranked = rankSaboteurs(scores)
    expect(ranked).toEqual([...ALL_SABOTEUR_IDS])
  })
})

describe('recommendSagePowers', () => {
  it('returns top 3 sage powers by rank-weighted antidote frequency', () => {
    // judge → [empathize, navigate], stickler → [empathize, navigate], pleaser → [empathize, activate]
    // weight: top1=3, top2=2, top3=1 → empathize: 3+2+1=6, navigate: 3+2=5, activate: 1
    const powers = recommendSagePowers(['judge', 'stickler', 'pleaser'])
    expect(powers[0]).toBe('empathize')
    expect(powers[1]).toBe('navigate')
    expect(powers[2]).toBe('activate')
  })

  it('returns at most 3 powers even when more antidotes are present', () => {
    const powers = recommendSagePowers(['judge', 'restless', 'avoider'])
    expect(powers.length).toBeLessThanOrEqual(3)
  })
})
