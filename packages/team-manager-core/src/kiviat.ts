import type { Archetype, CVFScores, KiviatData, TeamMemberProfile } from '@team-manager/shared'

const ALL_ARCHETYPES: Archetype[] = ['expert', 'coordinator', 'peer', 'coach', 'strategist']
const CVF_QUADRANTS: (keyof CVFScores)[] = ['clan', 'adhocracy', 'market', 'hierarchy']

export function validateSkillLevel(level: number): void {
  if (!Number.isInteger(level) || level < 0 || level > 4) {
    throw new Error(`Skill level must be an integer between 0 and 4, got ${level}`)
  }
}

export function computeKiviatData(members: TeamMemberProfile[]): KiviatData {
  // Archetype distribution
  const archetypeDistribution = Object.fromEntries(
    ALL_ARCHETYPES.map(a => [a, 0])
  ) as Record<Archetype, number>

  for (const { leadership } of members) {
    if (leadership) {
      archetypeDistribution[leadership.archetype]++
    }
  }

  // CVF average
  const cvfMembers = members.filter(m => m.cvf)
  let cvfAverage: CVFScores = { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
  if (cvfMembers.length > 0) {
    const n = cvfMembers.length
    cvfAverage = {
      clan:      cvfMembers.reduce((sum, m) => sum + m.cvf!.results.clan, 0) / n,
      adhocracy: cvfMembers.reduce((sum, m) => sum + m.cvf!.results.adhocracy, 0) / n,
      market:    cvfMembers.reduce((sum, m) => sum + m.cvf!.results.market, 0) / n,
      hierarchy: cvfMembers.reduce((sum, m) => sum + m.cvf!.results.hierarchy, 0) / n,
    }
  }

  // Skills average
  const skillBuckets = new Map<string, number[]>()
  for (const { skills } of members) {
    for (const { skillId, level } of skills) {
      if (!skillBuckets.has(skillId)) skillBuckets.set(skillId, [])
      skillBuckets.get(skillId)!.push(level)
    }
  }

  const skillsAverage: Record<string, number> = {}
  for (const [skillId, levels] of skillBuckets) {
    skillsAverage[skillId] = levels.reduce((sum, l) => sum + l, 0) / levels.length
  }

  return { archetypeDistribution, cvfAverage, skillsAverage }
}
