import { describe, it, expect } from 'vitest'
import { computeLeadershipScores, computeArchetype, computeGolemansStyles } from './leadership.js'

// Pair mapping (1-indexed questions → 0-indexed answers):
// q1+q11 → catalyzing  (idx 0+10)
// q2+q9  → envisioning (idx 1+8)
// q3+q12 → demanding   (idx 2+11)
// q4+q10 → coaching    (idx 3+9)
// q5+q7  → conducting  (idx 4+6)
// q6+q8  → directing   (idx 5+7)

const makeAnswers = (overrides: Partial<Record<number, number>> = {}): number[] => {
  const base = Array(12).fill(1)
  for (const [idx, val] of Object.entries(overrides)) {
    base[Number(idx)] = val
  }
  return base
}

describe('computeLeadershipScores', () => {
  it('sums pairs correctly from known answers', () => {
    // q1=8, q11=9 → catalyzing=17; q6=10, q8=10 → directing=20; rest minimal
    const answers = makeAnswers({ 0: 8, 10: 9, 5: 10, 7: 10 })
    const scores = computeLeadershipScores(answers)
    expect(scores.catalyzing).toBe(17)
    expect(scores.directing).toBe(20)
    expect(scores.envisioning).toBe(2) // 1+1
    expect(scores.demanding).toBe(2)
    expect(scores.coaching).toBe(2)
    expect(scores.conducting).toBe(2)
  })

  it('returns minimum scores (all answers = 1)', () => {
    const answers = Array(12).fill(1)
    const scores = computeLeadershipScores(answers)
    expect(scores.catalyzing).toBe(2)
    expect(scores.envisioning).toBe(2)
    expect(scores.demanding).toBe(2)
    expect(scores.coaching).toBe(2)
    expect(scores.conducting).toBe(2)
    expect(scores.directing).toBe(2)
  })

  it('returns maximum scores (all answers = 10)', () => {
    const answers = Array(12).fill(10)
    const scores = computeLeadershipScores(answers)
    expect(scores.catalyzing).toBe(20)
    expect(scores.envisioning).toBe(20)
    expect(scores.demanding).toBe(20)
    expect(scores.coaching).toBe(20)
    expect(scores.conducting).toBe(20)
    expect(scores.directing).toBe(20)
  })

  it('throws if answers length is not 12', () => {
    expect(() => computeLeadershipScores([1, 2, 3])).toThrow()
  })

  it('throws if any answer is out of range 1-10', () => {
    const answers = Array(12).fill(5)
    answers[3] = 11
    expect(() => computeLeadershipScores(answers)).toThrow()
    answers[3] = 0
    expect(() => computeLeadershipScores(answers)).toThrow()
  })
})

describe('computeArchetype', () => {
  it('returns "expert" when directing + demanding dominate', () => {
    const scores = { directing: 18, demanding: 16, conducting: 8, coaching: 6, catalyzing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('expert')
  })

  it('returns "coordinator" when demanding + conducting dominate', () => {
    const scores = { demanding: 18, conducting: 16, directing: 8, coaching: 6, catalyzing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('coordinator')
  })

  it('returns "peer" when conducting + coaching dominate', () => {
    const scores = { conducting: 18, coaching: 16, demanding: 8, directing: 6, catalyzing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('peer')
  })

  it('returns "coach" when coaching > catalyzing and both dominate', () => {
    const scores = { coaching: 18, catalyzing: 16, conducting: 8, demanding: 6, directing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('coach')
  })

  it('returns "strategist" when catalyzing > coaching and both dominate', () => {
    const scores = { catalyzing: 18, coaching: 16, conducting: 8, demanding: 6, directing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('strategist')
  })

  it('returns "coach" when coaching === catalyzing (coaching takes priority)', () => {
    const scores = { coaching: 18, catalyzing: 18, conducting: 8, demanding: 6, directing: 4, envisioning: 4 }
    expect(computeArchetype(scores)).toBe('coach')
  })
})

describe('computeGolemansStyles', () => {
  it('maps expert → coercive + pacesetting', () => {
    expect(computeGolemansStyles('expert')).toEqual(['coercive', 'pacesetting'])
  })

  it('maps coordinator → pacesetting + democratic', () => {
    expect(computeGolemansStyles('coordinator')).toEqual(['pacesetting', 'democratic'])
  })

  it('maps peer → democratic + coaching', () => {
    expect(computeGolemansStyles('peer')).toEqual(['democratic', 'coaching'])
  })

  it('maps coach → coaching + visionary', () => {
    expect(computeGolemansStyles('coach')).toEqual(['coaching', 'visionary'])
  })

  it('maps strategist → visionary + coaching', () => {
    expect(computeGolemansStyles('strategist')).toEqual(['visionary', 'coaching'])
  })
})
