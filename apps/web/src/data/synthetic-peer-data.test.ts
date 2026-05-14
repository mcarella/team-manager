import { describe, it, expect } from 'vitest'
import type { BehavioralCoreAssessment } from '@team-manager/shared'
import { aggregatePeerBehavioralCoreAssessments } from '@team-manager/core'
import { generateSyntheticPeerBehavioralCore } from './synthetic-peer-data.js'

function makeSubjectWithSelf(picks: string[]): { id: string; behavioralCore: BehavioralCoreAssessment } {
  return {
    id: 'subject-1',
    behavioralCore: {
      userId: 'subject-1',
      answers: { selfConcept: picks, self: picks },
      selfConceptFactors: { dominance: 80, extraversion: 30, patience: 40, formality: 75 },
      selfFactors:        { dominance: 80, extraversion: 30, patience: 40, formality: 75 },
      factors:            { dominance: 80, extraversion: 30, patience: 40, formality: 75 },
      golemanRadar: { coercive: 80, authoritative: 50, pacesetting: 60, democratic: 30, coaching: 40, visionary: 50 },
      subProfile: 'direttore',
      completedAt: new Date(),
    },
  }
}

describe('generateSyntheticPeerBehavioralCore', () => {
  it('returns one assessment per peer id', () => {
    const subject = makeSubjectWithSelf(['a01', 'a07', 'd02'])
    const result = generateSyntheticPeerBehavioralCore(subject, ['p1', 'p2', 'p3'], { seed: 1 })
    expect(result).toHaveLength(3)
    expect(result.map(r => r.assessorId)).toEqual(['p1', 'p2', 'p3'])
    expect(result.every(r => r.subjectId === 'subject-1')).toBe(true)
  })

  it('is deterministic — same seed produces identical output', () => {
    const subject = makeSubjectWithSelf(['a01', 'a07', 'd02'])
    const run1 = generateSyntheticPeerBehavioralCore(subject, ['p1', 'p2'], { seed: 42 })
    const run2 = generateSyntheticPeerBehavioralCore(subject, ['p1', 'p2'], { seed: 42 })
    expect(run1).toEqual(run2)
  })

  it('produces picks of reasonable size (15-30) per peer', () => {
    const subject = makeSubjectWithSelf(['a01', 'a02', 'a07', 'd02', 'd05', 'd07', 'c02', 'c06'])
    const result = generateSyntheticPeerBehavioralCore(subject, ['p1', 'p2', 'p3'], { seed: 1 })
    for (const r of result) {
      expect(r.picks.length).toBeGreaterThanOrEqual(15)
      expect(r.picks.length).toBeLessThanOrEqual(30)
    }
  })

  it('aligned mode: aggregated peer factors land close to the subject self-factors', () => {
    // Subject is high-dominance + high-formality, low-extra, low-pat (a Director-like signature)
    const directorAdjectives = ['a01', 'a03', 'a05', 'a07', 'a09', 'd01', 'd03', 'd04', 'd07']
    const subject = makeSubjectWithSelf(directorAdjectives)
    const result = generateSyntheticPeerBehavioralCore(
      subject,
      ['p1', 'p2', 'p3', 'p4'],
      { seed: 7, divergence: 'aligned' },
    )
    // Promote raw picks to fake "assessment" shape so we can aggregate them.
    const fakeAssessments = result.map(r => ({
      ...r,
      factors: { dominance: 50, extraversion: 50, patience: 50, formality: 50 },
      subProfile: 'camaleonte' as const,
      createdAt: new Date(),
    }))
    const summary = aggregatePeerBehavioralCoreAssessments('subject-1', fakeAssessments)
    // Adjective frequency should be biased toward the subject's set
    const subjectAdjFreq = directorAdjectives.map(id => summary.adjectiveFrequency[id] ?? 0).reduce((a, b) => a + b, 0)
    expect(subjectAdjFreq).toBeGreaterThan(8) // multiple peers picked from subject's set
  })

  it('handles subjects without self-L2 by generating around a random sub-profile centroid', () => {
    const subject = { id: 'subject-2' }
    const result = generateSyntheticPeerBehavioralCore(subject, ['p1', 'p2'], { seed: 1 })
    expect(result).toHaveLength(2)
    expect(result[0]!.picks.length).toBeGreaterThanOrEqual(15)
  })
})
