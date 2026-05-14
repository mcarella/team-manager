import { describe, it, expect } from 'vitest'
import { pickTopSkillsToImprove } from './skills.js'
import type { SkillAssessment, SkillLevel } from '@team-manager/shared'

function make(skillId: string, level: SkillLevel): SkillAssessment {
  return { userId: 'u', skillId, level }
}

describe('pickTopSkillsToImprove', () => {
  it('returns lowest-level skills first', () => {
    const out = pickTopSkillsToImprove([
      make('a', 3),
      make('b', 0),
      make('c', 1),
      make('d', 2),
    ], 3)
    expect(out.map(s => s.skillId)).toEqual(['b', 'c', 'd'])
  })

  it('skips skills at the cap (level 4)', () => {
    const out = pickTopSkillsToImprove([
      make('a', 4),
      make('b', 3),
      make('c', 1),
    ], 3)
    expect(out.map(s => s.skillId)).toEqual(['c', 'b'])
    expect(out).toHaveLength(2)
  })

  it('breaks ties by skillId for stable output', () => {
    const out = pickTopSkillsToImprove([
      make('zebra',  1),
      make('apple',  1),
      make('mango',  1),
    ], 3)
    expect(out.map(s => s.skillId)).toEqual(['apple', 'mango', 'zebra'])
  })

  it('returns empty when all skills are at the cap', () => {
    const out = pickTopSkillsToImprove([
      make('a', 4),
      make('b', 4),
    ])
    expect(out).toEqual([])
  })

  it('returns fewer than n when input is short', () => {
    const out = pickTopSkillsToImprove([make('a', 0)], 5)
    expect(out).toHaveLength(1)
  })

  it('defaults n to 3', () => {
    const out = pickTopSkillsToImprove([
      make('a', 0),
      make('b', 0),
      make('c', 0),
      make('d', 0),
    ])
    expect(out).toHaveLength(3)
  })
})
