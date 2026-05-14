import { describe, it, expect } from 'vitest'
import { aggregatePeerLeadershipAssessments, computeBehaviorDeltas } from './peer-leadership.js'
import { computeLeadershipScores, computeArchetype } from './leadership.js'
import type { LeadershipScores, PeerLeadershipAssessment, PeerLeadershipSummary } from '@team-manager/shared'

function makeAssessment(
  assessorId: string,
  subjectId: string,
  answers: number[],
): PeerLeadershipAssessment {
  const scores = computeLeadershipScores(answers)
  const archetype = computeArchetype(scores)
  return { assessorId, subjectId, answers, scores, archetype, createdAt: new Date() }
}

describe('aggregatePeerLeadershipAssessments', () => {
  it('returns zero summary when no assessments', () => {
    const s = aggregatePeerLeadershipAssessments('user-1', [])
    expect(s.totalEvaluators).toBe(0)
    expect(s.dominantArchetype).toBeNull()
    expect(s.behaviors.coaching.count).toBe(0)
  })

  it('counts unique evaluators correctly', () => {
    const a = makeAssessment('eva', 'sub', Array(12).fill(5))
    const b = makeAssessment('bob', 'sub', Array(12).fill(5))
    const s = aggregatePeerLeadershipAssessments('sub', [a, b])
    expect(s.totalEvaluators).toBe(2)
  })

  it('filters to the correct subject', () => {
    const a = makeAssessment('eva', 'sub-1', Array(12).fill(5))
    const b = makeAssessment('eva', 'sub-2', Array(12).fill(10))
    const s = aggregatePeerLeadershipAssessments('sub-1', [a, b])
    expect(s.totalEvaluators).toBe(1)
  })

  it('upserts: same assessor counted once (last wins)', () => {
    const a = makeAssessment('eva', 'sub', Array(12).fill(3))
    const b = makeAssessment('eva', 'sub', Array(12).fill(7))
    const s = aggregatePeerLeadershipAssessments('sub', [a, b])
    expect(s.totalEvaluators).toBe(1)
    // pairs for all-7: catalyzing = 7+7=14, so average should be 14
    expect(s.behaviors.catalyzing.average).toBe(14)
  })

  it('averages behavior scores correctly across evaluators', () => {
    // assessor A: all answers = 2 → each pair = 4
    // assessor B: all answers = 8 → each pair = 16
    // average = 10
    const a = makeAssessment('a', 'sub', Array(12).fill(2))
    const b = makeAssessment('b', 'sub', Array(12).fill(8))
    const s = aggregatePeerLeadershipAssessments('sub', [a, b])
    expect(s.behaviors.directing.average).toBe(10)
    expect(s.behaviors.coaching.average).toBe(10)
    expect(s.behaviors.coaching.count).toBe(2)
  })

  it('computes dominant archetype from archetype counts', () => {
    // expert: directing(q6+q8)=20 highest, demanding second
    const expertAnswers = [1,1,8,1,1,10,1,10,1,1,1,8] // directing=20, demanding=16
    // coach: coaching(q4+q10) highest
    const coachAnswers  = [1,1,1,10,1,1,1,1,1,10,1,1]   // coaching=20
    const a = makeAssessment('a', 'sub', expertAnswers)
    const b = makeAssessment('b', 'sub', expertAnswers)
    const c = makeAssessment('c', 'sub', coachAnswers)
    const s = aggregatePeerLeadershipAssessments('sub', [a, b, c])
    expect(s.dominantArchetype).toBe('expert')
    expect(s.archetypeCounts['expert']).toBe(2)
    expect(s.archetypeCounts['coach']).toBe(1)
  })

  it('returns null dominantArchetype with no assessments', () => {
    const s = aggregatePeerLeadershipAssessments('x', [])
    expect(s.dominantArchetype).toBeNull()
  })
})

describe('computeBehaviorDeltas', () => {
  function makeSelf(overrides: Partial<LeadershipScores> = {}): LeadershipScores {
    return { catalyzing: 10, envisioning: 10, demanding: 10, coaching: 10, conducting: 10, directing: 10, ...overrides }
  }
  function makePeer(overrides: Partial<Record<keyof LeadershipScores, number>> = {}, evaluators = 3): PeerLeadershipSummary {
    const avgs = { catalyzing: 10, envisioning: 10, demanding: 10, coaching: 10, conducting: 10, directing: 10, ...overrides }
    return {
      subjectId: 'x',
      behaviors: {
        catalyzing:  { average: avgs.catalyzing,  count: evaluators },
        envisioning: { average: avgs.envisioning, count: evaluators },
        demanding:   { average: avgs.demanding,   count: evaluators },
        coaching:    { average: avgs.coaching,    count: evaluators },
        conducting:  { average: avgs.conducting,  count: evaluators },
        directing:   { average: avgs.directing,   count: evaluators },
      },
      archetypeCounts: {},
      dominantArchetype: null,
      totalEvaluators: evaluators,
    }
  }

  it('returns empty array when no peers evaluated', () => {
    expect(computeBehaviorDeltas(makeSelf(), makePeer({}, 0))).toEqual([])
  })

  it('classifies near-equal scores as aligned (|delta| ≤ 2)', () => {
    const deltas = computeBehaviorDeltas(makeSelf(), makePeer({ catalyzing: 11 }))
    const cat = deltas.find(d => d.behavior === 'catalyzing')!
    expect(cat.classification).toBe('aligned')
    expect(cat.delta).toBe(1)
  })

  it('classifies delta > 2 as hidden (peer sees more)', () => {
    const deltas = computeBehaviorDeltas(makeSelf({ catalyzing: 8 }), makePeer({ catalyzing: 14 }))
    const cat = deltas.find(d => d.behavior === 'catalyzing')!
    expect(cat.classification).toBe('hidden')
    expect(cat.delta).toBe(6)
  })

  it('classifies delta < -2 as blind (peer sees less)', () => {
    const deltas = computeBehaviorDeltas(makeSelf({ directing: 18 }), makePeer({ directing: 10 }))
    const dir = deltas.find(d => d.behavior === 'directing')!
    expect(dir.classification).toBe('blind')
    expect(dir.delta).toBe(-8)
  })

  it('returns one entry per behavior (6 total)', () => {
    expect(computeBehaviorDeltas(makeSelf(), makePeer()).length).toBe(6)
  })
})
