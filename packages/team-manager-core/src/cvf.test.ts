import { describe, it, expect } from 'vitest'
import { validateCVFCategory, computeCVFScores } from './cvf.js'
import type { CVFCategory } from '@team-manager/shared'

const validCategory: CVFCategory = { clan: 40, adhocracy: 30, market: 20, hierarchy: 10 }

describe('validateCVFCategory', () => {
  it('accepts a category that sums to 100', () => {
    expect(() => validateCVFCategory({ clan: 25, adhocracy: 25, market: 25, hierarchy: 25 })).not.toThrow()
    expect(() => validateCVFCategory(validCategory)).not.toThrow()
  })

  it('throws if values sum to less than 100', () => {
    expect(() => validateCVFCategory({ clan: 30, adhocracy: 30, market: 30, hierarchy: 9 })).toThrow()
  })

  it('throws if values sum to more than 100', () => {
    expect(() => validateCVFCategory({ clan: 30, adhocracy: 30, market: 30, hierarchy: 11 })).toThrow()
  })

  it('throws if any value is negative', () => {
    expect(() => validateCVFCategory({ clan: -10, adhocracy: 50, market: 40, hierarchy: 20 })).toThrow()
  })

  it('accepts extreme valid distribution (100/0/0/0)', () => {
    expect(() => validateCVFCategory({ clan: 100, adhocracy: 0, market: 0, hierarchy: 0 })).not.toThrow()
  })
})

describe('computeCVFScores', () => {
  it('sums each quadrant across 6 categories', () => {
    const categories: CVFCategory[] = Array(6).fill(validCategory)
    const scores = computeCVFScores(categories)
    expect(scores.clan).toBe(240)       // 40 × 6
    expect(scores.adhocracy).toBe(180)  // 30 × 6
    expect(scores.market).toBe(120)     // 20 × 6
    expect(scores.hierarchy).toBe(60)   // 10 × 6
  })

  it('returns max 600 when all categories give 100 to one quadrant', () => {
    const categories: CVFCategory[] = Array(6).fill({ clan: 100, adhocracy: 0, market: 0, hierarchy: 0 })
    const scores = computeCVFScores(categories)
    expect(scores.clan).toBe(600)
    expect(scores.adhocracy).toBe(0)
    expect(scores.market).toBe(0)
    expect(scores.hierarchy).toBe(0)
  })

  it('returns equal scores (150 each) when all categories are balanced', () => {
    const categories: CVFCategory[] = Array(6).fill({ clan: 25, adhocracy: 25, market: 25, hierarchy: 25 })
    const scores = computeCVFScores(categories)
    expect(scores.clan).toBe(150)
    expect(scores.adhocracy).toBe(150)
    expect(scores.market).toBe(150)
    expect(scores.hierarchy).toBe(150)
  })

  it('throws if not exactly 6 categories provided', () => {
    expect(() => computeCVFScores([])).toThrow()
    expect(() => computeCVFScores(Array(5).fill(validCategory))).toThrow()
    expect(() => computeCVFScores(Array(7).fill(validCategory))).toThrow()
  })

  it('throws if any category is invalid', () => {
    const bad: CVFCategory = { clan: 10, adhocracy: 10, market: 10, hierarchy: 10 } // sums to 40
    const categories: CVFCategory[] = [...Array(5).fill(validCategory), bad]
    expect(() => computeCVFScores(categories)).toThrow()
  })
})
