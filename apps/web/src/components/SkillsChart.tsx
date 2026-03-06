import type { Skill, SkillRole } from '@team-manager/shared'

const LEVEL_LABELS = ['Don\'t know', 'Know theory', 'Autonomous', 'Master', 'Can teach']

interface Props {
  skillsAverage: Record<string, number>
  skills: Skill[]
  roles?: SkillRole[]
}

export default function SkillsChart({ skillsAverage, skills, roles }: Props) {
  const entries = Object.entries(skillsAverage)

  if (entries.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Average</h3>
        <p className="text-sm text-gray-400">No skill assessments yet.</p>
      </div>
    )
  }

  // Build a lookup from both skills array and roles
  const nameMap = new Map<string, string>()
  for (const s of skills) nameMap.set(s.id, s.name)
  if (roles) {
    for (const r of roles) {
      for (const s of r.skills) {
        if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
      }
    }
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Average</h3>
      <div className="space-y-3">
        {entries.map(([skillId, avg]) => {
          const pct = (avg / 4) * 100
          const label = LEVEL_LABELS[Math.round(avg)] ?? ''
          return (
            <div key={skillId} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">{nameMap.get(skillId) ?? skillId}</span>
                <span className="text-gray-400">{avg.toFixed(1)} — {label}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
