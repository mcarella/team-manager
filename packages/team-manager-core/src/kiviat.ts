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
  const cvfAverage: CVFScores = cvfMembers.length === 0
    ? { clan: 0, adhocracy: 0, market: 0, hierarchy: 0 }
    : Object.fromEntries(
        CVF_QUADRANTS.map(q => [
          q,
          cvfMembers.reduce((sum, m) => sum + m.cvf!.results[q], 0) / cvfMembers.length,
        ])
      ) as CVFScores

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
