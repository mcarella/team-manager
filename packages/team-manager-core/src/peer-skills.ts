import type { PeerSkillAssessment, PeerSkillSummary } from '@team-manager/shared'

export function aggregatePeerSkillAssessments(
  subjectId: string,
  assessments: PeerSkillAssessment[],
): PeerSkillSummary {
  const forSubject = assessments.filter((a) => a.subjectId === subjectId)

  const skillMap = new Map<string, number[]>()
  const assessorSet = new Set<string>()

  for (const a of forSubject) {
    assessorSet.add(a.assessorId)
    const levels = skillMap.get(a.skillId)
    if (levels) {
      levels.push(a.level)
    } else {
      skillMap.set(a.skillId, [a.level])
    }
  }

  const skills: Record<string, { average: number; count: number }> = {}
  for (const [skillId, levels] of skillMap) {
    const sum = levels.reduce((acc, l) => acc + l, 0)
    skills[skillId] = {
      average: sum / levels.length,
      count: levels.length,
    }
  }

  return {
    subjectId,
    skills,
    totalEvaluators: assessorSet.size,
  }
}
