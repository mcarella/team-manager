import { describe, it, expect } from 'vitest'
import type {
  PeerBehavioralCoreAssessment,
  BehavioralCoreFactors,
  BehavioralCoreSubProfile,
} from '@team-manager/shared'
import {
  aggregatePeerBehavioralCoreAssessments,
  computeAdjectiveCloud,
} from './peer-behavioral-core.js'

function makeAssessment(
  assessorId: string,
  subjectId: string,
  picks: string[],
  factors: BehavioralCoreFactors,
  subProfile: BehavioralCoreSubProfile,
): PeerBehavioralCoreAssessment {
  return { assessorId, subjectId, picks, factors, subProfile, createdAt: new Date() }
}

describe('aggregatePeerBehavioralCoreAssessments', () => {
  it('returns neutral summary when no peers have assessed the subject', () => {
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', [])
    expect(result.totalEvaluators).toBe(0)
    expect(result.adjectiveFrequency).toEqual({})
    expect(result.factors).toEqual({ dominance: 50, extraversion: 50, patience: 50, formality: 50 })
    expect(result.subProfile).toBeNull()
    expect(result.subProfileCounts).toEqual({})
  })

  it('filters to assessments matching the requested subjectId', () => {
    const data = [
      makeAssessment('p1', 'subject-1', ['a01'], { dominance: 70, extraversion: 50, patience: 50, formality: 50 }, 'direttore'),
      makeAssessment('p2', 'subject-2', ['a02'], { dominance: 30, extraversion: 50, patience: 50, formality: 50 }, 'armonizzatore'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.totalEvaluators).toBe(1)
    expect(result.factors.dominance).toBe(70)
  })

  it('upserts by assessorId (last wins) so a peer cannot be double-counted', () => {
    const data = [
      makeAssessment('p1', 'subject-1', ['a01'], { dominance: 30, extraversion: 50, patience: 50, formality: 50 }, 'armonizzatore'),
      makeAssessment('p1', 'subject-1', ['a07'], { dominance: 90, extraversion: 50, patience: 50, formality: 50 }, 'direttore'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.totalEvaluators).toBe(1)
    expect(result.factors.dominance).toBe(90) // last wins
    expect(result.adjectiveFrequency).toEqual({ a07: 1 }) // not a01
  })

  it('averages factors across multiple unique peer assessments', () => {
    const data = [
      makeAssessment('p1', 'subject-1', ['a01'], { dominance: 80, extraversion: 40, patience: 60, formality: 70 }, 'direttore'),
      makeAssessment('p2', 'subject-1', ['a02'], { dominance: 60, extraversion: 60, patience: 40, formality: 50 }, 'capitano'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.totalEvaluators).toBe(2)
    expect(result.factors.dominance).toBe(70)
    expect(result.factors.extraversion).toBe(50)
    expect(result.factors.patience).toBe(50)
    expect(result.factors.formality).toBe(60)
  })

  it('builds adjective frequency map across peer picks', () => {
    const data = [
      makeAssessment('p1', 'subject-1', ['a01', 'a02', 'b01'], { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'camaleonte'),
      makeAssessment('p2', 'subject-1', ['a01', 'b02'],         { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'camaleonte'),
      makeAssessment('p3', 'subject-1', ['a01', 'a02'],         { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'camaleonte'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.adjectiveFrequency).toEqual({ a01: 3, a02: 2, b01: 1, b02: 1 })
  })

  it('counts how many peers landed on each sub-profile', () => {
    const data = [
      makeAssessment('p1', 'subject-1', [], { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'direttore'),
      makeAssessment('p2', 'subject-1', [], { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'direttore'),
      makeAssessment('p3', 'subject-1', [], { dominance: 50, extraversion: 50, patience: 50, formality: 50 }, 'capitano'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.subProfileCounts).toEqual({ direttore: 2, capitano: 1 })
  })

  it('matches a sub-profile from the averaged factors', () => {
    // Three peers all see strong director traits (high dom + low extra + low pat + high form)
    const data = [
      makeAssessment('p1', 'subject-1', [], { dominance: 80, extraversion: 20, patience: 20, formality: 80 }, 'direttore'),
      makeAssessment('p2', 'subject-1', [], { dominance: 80, extraversion: 20, patience: 20, formality: 80 }, 'direttore'),
      makeAssessment('p3', 'subject-1', [], { dominance: 80, extraversion: 20, patience: 20, formality: 80 }, 'direttore'),
    ]
    const result = aggregatePeerBehavioralCoreAssessments('subject-1', data)
    expect(result.subProfile).toBe('direttore')
  })
})

describe('computeAdjectiveCloud', () => {
  it('returns an empty array when the summary has no adjective frequencies', () => {
    const cloud = computeAdjectiveCloud({
      subjectId: 'x',
      totalEvaluators: 0,
      adjectiveFrequency: {},
      factors: { dominance: 50, extraversion: 50, patience: 50, formality: 50 },
      subProfile: null,
      subProfileCounts: {},
    })
    expect(cloud).toEqual([])
  })

  it('returns adjectives sorted descending by count and enriched with factor + weight', () => {
    const cloud = computeAdjectiveCloud({
      subjectId: 'x',
      totalEvaluators: 4,
      adjectiveFrequency: { a01: 3, c02: 4, b01: 1, d01: 2 },
      factors: { dominance: 50, extraversion: 50, patience: 50, formality: 50 },
      subProfile: null,
      subProfileCounts: {},
    })
    expect(cloud.map(c => c.adjectiveId)).toEqual(['c02', 'a01', 'd01', 'b01'])
    expect(cloud[0]).toMatchObject({ adjectiveId: 'c02', count: 4, factor: 'patience' })
    expect(cloud[1]).toMatchObject({ adjectiveId: 'a01', count: 3, factor: 'dominance' })
  })

  it('truncates to topN', () => {
    const adjectiveFrequency: Record<string, number> = {}
    for (let i = 1; i <= 50; i++) adjectiveFrequency[`a${String(i).padStart(2, '0')}`] = i
    const cloud = computeAdjectiveCloud(
      {
        subjectId: 'x',
        totalEvaluators: 3,
        adjectiveFrequency,
        factors: { dominance: 50, extraversion: 50, patience: 50, formality: 50 },
        subProfile: null,
        subProfileCounts: {},
      },
      10,
    )
    expect(cloud).toHaveLength(10)
    // First 10 of A's 20 adjectives only, since I gave 50 keys but only first 20 are valid A IDs.
    // The function should silently filter unknowns and truncate to 10 valid ones.
  })

  it('silently skips adjective IDs not present in the instrument bank', () => {
    const cloud = computeAdjectiveCloud({
      subjectId: 'x',
      totalEvaluators: 1,
      adjectiveFrequency: { 'not-a-real-id': 5, a01: 1 },
      factors: { dominance: 50, extraversion: 50, patience: 50, formality: 50 },
      subProfile: null,
      subProfileCounts: {},
    })
    expect(cloud.map(c => c.adjectiveId)).toEqual(['a01'])
  })
})
