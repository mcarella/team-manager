import { describe, it, expect } from 'vitest'
import { validateSkillLevel, computeKiviatData } from './kiviat.js'
import type { TeamMemberProfile, CVFScores } from '@team-manager/shared'

// --- Fixtures ---

const makeUser = (id: string) => ({
  id,
  email: `${id}@test.com`,
  name: id,
  orgId: 'org1',
  role: 'member' as const,
})

const makeCVFResults = (clan: number, adhocracy: number, market: number, hierarchy: number): CVFScores =>
  ({ clan, adhocracy, market, hierarchy })

const makeLeadership = (archetype: 'expert' | 'coordinator' | 'peer' | 'coach' | 'strategist') => ({
  userId: 'u',
  answers: Array(12).fill(5),
  scores: { catalyzing: 10, envisioning: 10, demanding: 10, coaching: 10, conducting: 10, directing: 10 },
  archetype,
  golemansStyles: [] as any,
  completedAt: new Date(),
})

const makeCVF = (results: CVFScores) => ({
  userId: 'u',
  categories: [],
  results,
  completedAt: new Date(),
})

// --- Tests ---

describe('validateSkillLevel', () => {
  it('accepts valid levels 0-4', () => {
    for (const level of [0, 1, 2, 3, 4]) {
      expect(() => validateSkillLevel(level)).not.toThrow()
    }
  })

  it('throws for level above 4', () => {
    expect(() => validateSkillLevel(5)).toThrow()
  })

  it('throws for negative level', () => {
    expect(() => validateSkillLevel(-1)).toThrow()
  })

  it('throws for non-integer level', () => {
    expect(() => validateSkillLevel(2.5)).toThrow()
  })
})

describe('computeKiviatData — archetypeDistribution', () => {
  it('counts each archetype from members with leadership assessments', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), leadership: makeLeadership('expert'), skills: [] },
      { user: makeUser('b'), leadership: makeLeadership('expert'), skills: [] },
      { user: makeUser('c'), leadership: makeLeadership('peer'),   skills: [] },
    ]
    const { archetypeDistribution } = computeKiviatData(members)
    expect(archetypeDistribution.expert).toBe(2)
    expect(archetypeDistribution.peer).toBe(1)
    expect(archetypeDistribution.coordinator).toBe(0)
    expect(archetypeDistribution.coach).toBe(0)
    expect(archetypeDistribution.strategist).toBe(0)
  })

  it('returns all zeros when no members have leadership assessment', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), skills: [] },
    ]
    const { archetypeDistribution } = computeKiviatData(members)
    expect(Object.values(archetypeDistribution).every(v => v === 0)).toBe(true)
  })
})

describe('computeKiviatData — cvfAverage', () => {
  it('averages CVF scores across members with CVF assessment', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), cvf: makeCVF(makeCVFResults(200, 100, 200, 100)), skills: [] },
      { user: makeUser('b'), cvf: makeCVF(makeCVFResults(400, 300, 200, 100)), skills: [] }, // wait these should already be sums (0-600)
    ]
    const { cvfAverage } = computeKiviatData(members)
    expect(cvfAverage.clan).toBe(300)       // (200+400)/2
    expect(cvfAverage.adhocracy).toBe(200)  // (100+300)/2
    expect(cvfAverage.market).toBe(200)     // (200+200)/2
    expect(cvfAverage.hierarchy).toBe(100)  // (100+100)/2
  })

  it('returns zero CVF average when no members have CVF assessment', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), skills: [] },
    ]
    const { cvfAverage } = computeKiviatData(members)
    expect(cvfAverage).toEqual({ clan: 0, adhocracy: 0, market: 0, hierarchy: 0 })
  })

  it('ignores members without CVF assessment in the average', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), cvf: makeCVF(makeCVFResults(600, 0, 0, 0)), skills: [] },
      { user: makeUser('b'), skills: [] }, // no CVF
    ]
    const { cvfAverage } = computeKiviatData(members)
    expect(cvfAverage.clan).toBe(600) // only member a counts
  })
})

describe('computeKiviatData — skillsAverage', () => {
  it('averages skill levels per skillId across members', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), skills: [{ userId: 'a', skillId: 'ts', level: 4 }, { userId: 'a', skillId: 'react', level: 2 }] },
      { user: makeUser('b'), skills: [{ userId: 'b', skillId: 'ts', level: 2 }, { userId: 'b', skillId: 'react', level: 4 }] },
    ]
    const { skillsAverage } = computeKiviatData(members)
    expect(skillsAverage['ts']).toBe(3)     // (4+2)/2
    expect(skillsAverage['react']).toBe(3)  // (2+4)/2
  })

  it('handles skills not shared by all members', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), skills: [{ userId: 'a', skillId: 'ts', level: 4 }] },
      { user: makeUser('b'), skills: [] },
    ]
    const { skillsAverage } = computeKiviatData(members)
    expect(skillsAverage['ts']).toBe(4) // only member a has it
  })

  it('returns empty skills average when no members have skills', () => {
    const members: TeamMemberProfile[] = [
      { user: makeUser('a'), skills: [] },
    ]
    const { skillsAverage } = computeKiviatData(members)
    expect(skillsAverage).toEqual({})
  })

  it('returns empty KiviatData for empty team', () => {
    const { archetypeDistribution, cvfAverage, skillsAverage } = computeKiviatData([])
    expect(Object.values(archetypeDistribution).every(v => v === 0)).toBe(true)
    expect(cvfAverage).toEqual({ clan: 0, adhocracy: 0, market: 0, hierarchy: 0 })
    expect(skillsAverage).toEqual({})
  })
})
