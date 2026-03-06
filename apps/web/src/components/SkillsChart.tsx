import type { Skill } from '@team-manager/shared'

const LEVEL_LABELS = ['Don\'t know', 'Know theory', 'Autonomous', 'Master', 'Can teach']

interface Props {
  skillsAverage: Record<string, number>
  skills: Skill[]
}

export default function SkillsChart({ skillsAverage, skills }: Props) {
  const entries = Object.entries(skillsAverage)

  if (entries.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Average</h3>
        <p className="text-sm text-gray-400">No skill assessments yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Average</h3>
      <div className="space-y-3">
        {entries.map(([skillId, avg]) => {
          const skill = skills.find(s => s.id === skillId)
          const pct = (avg / 4) * 100
          const label = LEVEL_LABELS[Math.round(avg)] ?? ''
          return (
            <div key={skillId} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">{skill?.name ?? skillId}</span>
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
