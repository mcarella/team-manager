import { describe, it, expect } from 'vitest'
import { aggregatePeerSkillAssessments } from './peer-skills.js'
import type { PeerSkillAssessment } from '@team-manager/shared'

function makeAssessment(
  assessorId: string,
  subjectId: string,
  skillId: string,
  level: 0 | 1 | 2 | 3 | 4,
): PeerSkillAssessment {
  return { assessorId, subjectId, skillId, level, createdAt: new Date() }
}

describe('aggregatePeerSkillAssessments', () => {
  it('returns empty summary when no assessments provided', () => {
    const result = aggregatePeerSkillAssessments('user-1', [])
    expect(result).toEqual({
      subjectId: 'user-1',
      skills: {},
      totalEvaluators: 0,
    })
  })

  it('computes average and count for a single skill with one evaluator', () => {
    const assessments = [makeAssessment('peer-1', 'user-1', 'skill-a', 3)]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 3, count: 1 })
    expect(result.totalEvaluators).toBe(1)
  })

  it('computes average across multiple evaluators for one skill', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 2),
      makeAssessment('peer-2', 'user-1', 'skill-a', 4),
      makeAssessment('peer-3', 'user-1', 'skill-a', 3),
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 3, count: 3 })
    expect(result.totalEvaluators).toBe(3)
  })

  it('handles multiple skills independently', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 4),
      makeAssessment('peer-1', 'user-1', 'skill-b', 2),
      makeAssessment('peer-2', 'user-1', 'skill-a', 2),
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 3, count: 2 })
    expect(result.skills['skill-b']).toEqual({ average: 2, count: 1 })
    expect(result.totalEvaluators).toBe(2)
  })

  it('counts totalEvaluators as unique assessors', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 3),
      makeAssessment('peer-1', 'user-1', 'skill-b', 2),
      makeAssessment('peer-2', 'user-1', 'skill-a', 4),
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.totalEvaluators).toBe(2)
  })

  it('filters out assessments for other subjects', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 4),
      makeAssessment('peer-1', 'user-2', 'skill-a', 1), // different subject
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 4, count: 1 })
    expect(result.totalEvaluators).toBe(1)
  })

  it('computes correct average with fractional result', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 1),
      makeAssessment('peer-2', 'user-1', 'skill-a', 2),
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 1.5, count: 2 })
  })

  it('handles all skill levels (0-4)', () => {
    const assessments = [
      makeAssessment('peer-1', 'user-1', 'skill-a', 0),
      makeAssessment('peer-2', 'user-1', 'skill-a', 4),
    ]
    const result = aggregatePeerSkillAssessments('user-1', assessments)
    expect(result.skills['skill-a']).toEqual({ average: 2, count: 2 })
  })
})
