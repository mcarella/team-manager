import { describe, it, expect } from 'vitest'
import { aggregatePeerCVFAssessments } from './peer-cvf.js'
import type { PeerCVFAssessment, CVFCategory } from '@team-manager/shared'

function makeCategories(clan: number, adhocracy: number, market: number, hierarchy: number): CVFCategory[] {
  // 6 identical categories for simplicity
  return Array(6).fill({ clan, adhocracy, market, hierarchy })
}

function makeAssessment(assessorId: string, subjectId: string, clan: number, adhocracy: number, market: number, hierarchy: number): PeerCVFAssessment {
  const categories = makeCategories(clan, adhocracy, market, hierarchy)
  return {
    assessorId,
    subjectId,
    categories,
    results: { clan: clan * 6, adhocracy: adhocracy * 6, market: market * 6, hierarchy: hierarchy * 6 },
    createdAt: new Date(),
  }
}

describe('aggregatePeerCVFAssessments', () => {
  it('returns zero summary when no assessments', () => {
    const s = aggregatePeerCVFAssessments('user-1', [])
    expect(s.totalEvaluators).toBe(0)
    expect(s.results.clan).toBe(0)
    expect(s.results.adhocracy).toBe(0)
  })

  it('filters to the correct subject', () => {
    const a = makeAssessment('eva', 'sub-1', 40, 30, 20, 10)
    const b = makeAssessment('eva', 'sub-2', 10, 20, 30, 40)
    const s = aggregatePeerCVFAssessments('sub-1', [a, b])
    expect(s.totalEvaluators).toBe(1)
    expect(s.results.clan).toBe(240) // 40 * 6
  })

  it('counts unique evaluators correctly', () => {
    const a = makeAssessment('eva', 'sub', 25, 25, 25, 25)
    const b = makeAssessment('bob', 'sub', 25, 25, 25, 25)
    const s = aggregatePeerCVFAssessments('sub', [a, b])
    expect(s.totalEvaluators).toBe(2)
  })

  it('upserts: same assessor counted once (last wins)', () => {
    const a = makeAssessment('eva', 'sub', 40, 30, 20, 10)
    const b = makeAssessment('eva', 'sub', 10, 20, 30, 40)
    const s = aggregatePeerCVFAssessments('sub', [a, b])
    expect(s.totalEvaluators).toBe(1)
    expect(s.results.clan).toBe(60) // 10 * 6
  })

  it('averages results correctly across evaluators', () => {
    // eva: clan=60*6=360, bob: clan=0*6=0 → avg clan=180
    const a = makeAssessment('eva', 'sub', 60, 20, 10, 10)
    const b = makeAssessment('bob', 'sub', 0,  20, 40, 40)
    const s = aggregatePeerCVFAssessments('sub', [a, b])
    expect(s.results.clan).toBe(180)
    expect(s.results.adhocracy).toBe(120) // (120+120)/2
    expect(s.results.market).toBe(150)    // (60+240)/2
    expect(s.results.hierarchy).toBe(150) // (60+240)/2
  })
})
