import type { CVFScores } from '@team-manager/shared'

const QUADRANT_META: Record<keyof CVFScores, { label: string; color: string; description: string }> = {
  clan:      { label: 'Clan',      color: 'bg-green-500',  description: 'People-first, collaborative culture' },
  adhocracy: { label: 'Adhocracy', color: 'bg-yellow-500', description: 'Innovation, creativity, risk-taking' },
  market:    { label: 'Market',    color: 'bg-red-500',    description: 'Results-driven, competitive focus' },
  hierarchy: { label: 'Hierarchy', color: 'bg-blue-500',   description: 'Stability, control, process' },
}

interface Props {
  results: CVFScores
}

export default function CVFResultCard({ results }: Props) {
  const max = 600

  return (
    <div className="w-full max-w-lg space-y-4">
      <h2 className="text-xl font-bold text-center">Your CVF Profile</h2>
      {(Object.keys(QUADRANT_META) as (keyof CVFScores)[]).map(q => {
        const { label, color, description } = QUADRANT_META[q]
        const score = results[q]
        const pct = Math.round((score / max) * 100)
        return (
          <div key={q} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-sm">{label}</span>
              <span className="text-xs text-gray-500">{score} / {max}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className={`${color} h-4 rounded-full transition-all duration-500`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">{description}</p>
          </div>
        )
      })}
    </div>
  )
}
