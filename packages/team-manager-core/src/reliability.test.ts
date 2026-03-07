import { describe, it, expect } from 'vitest'
import { computeProfileReliability } from './reliability.js'

describe('computeProfileReliability', () => {
  it('returns none status when evaluators is 0', () => {
    const r = computeProfileReliability(0, 5)
    expect(r.status).toBe('none')
    expect(r.coverage).toBe(0)
    expect(r.evaluators).toBe(0)
    expect(r.peers).toBe(4)
  })

  it('returns reliable when coverage meets default threshold (60%)', () => {
    const r = computeProfileReliability(3, 5) // 3/4 = 75%
    expect(r.status).toBe('reliable')
    expect(r.coverage).toBeCloseTo(0.75)
  })

  it('returns partial when coverage is below threshold but above 0', () => {
    const r = computeProfileReliability(1, 5) // 1/4 = 25%
    expect(r.status).toBe('partial')
    expect(r.coverage).toBeCloseTo(0.25)
  })

  it('returns reliable at exactly the threshold', () => {
    // 2/4 = 50% — below 60% default
    expect(computeProfileReliability(2, 5).status).toBe('partial')
    // 3/5 = 60% — custom threshold of 60%
    const r = computeProfileReliability(3, 6, 0.6)
    expect(r.status).toBe('reliable')
    expect(r.coverage).toBeCloseTo(0.6)
  })

  it('handles team of 1 (no peers possible) — always none', () => {
    const r = computeProfileReliability(0, 1)
    expect(r.status).toBe('none')
    expect(r.peers).toBe(0)
    expect(r.coverage).toBe(0)
  })

  it('handles team of 2 — one peer', () => {
    const r = computeProfileReliability(1, 2) // 1/1 = 100%
    expect(r.status).toBe('reliable')
    expect(r.coverage).toBe(1)
    expect(r.peers).toBe(1)
  })

  it('exposes teamSize and evaluators correctly', () => {
    const r = computeProfileReliability(3, 5)
    expect(r.teamSize).toBe(5)
    expect(r.evaluators).toBe(3)
    expect(r.peers).toBe(4)
  })

  it('accepts custom threshold', () => {
    const r = computeProfileReliability(1, 5, 0.2) // 1/4 = 25%, threshold 20%
    expect(r.status).toBe('reliable')
  })

  it('caps coverage at 1 if evaluators exceed peers (data anomaly)', () => {
    const r = computeProfileReliability(5, 3) // 5/2, should cap at 1
    expect(r.coverage).toBe(1)
    expect(r.status).toBe('reliable')
  })
})
