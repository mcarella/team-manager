import { describe, it, expect } from 'vitest'
import { aggregatePeerLeadershipAssessments } from './peer-leadership.js'
import { computeLeadershipScores, computeArchetype } from './leadership.js'
import type { PeerLeadershipAssessment } from '@team-manager/shared'

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
