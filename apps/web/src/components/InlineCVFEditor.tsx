import { useState } from 'react'
import type { CVFScores } from '@team-manager/shared'

const QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const
const LABELS: Record<string, string> = {
  clan: 'Clan',
  adhocracy: 'Adhocracy',
  market: 'Market',
  hierarchy: 'Hierarchy',
}
const HINTS: Record<string, string> = {
  clan: 'People first, collaboration, mentoring',
  adhocracy: 'Innovation, agility, experimentation',
  market: 'Results, competition, achievement',
  hierarchy: 'Stability, control, efficiency',
}

interface Props {
  initial?: CVFScores
  onSave: (scores: CVFScores) => void
  onCancel: () => void
}

export default function InlineCVFEditor({ initial, onSave, onCancel }: Props) {
  const [values, setValues] = useState<Record<string, number>>({
    clan: initial?.clan ?? 150,
    adhocracy: initial?.adhocracy ?? 150,
    market: initial?.market ?? 150,
    hierarchy: initial?.hierarchy ?? 150,
  })

  const total = Object.values(values).reduce((s, v) => s + v, 0)

  const handleChange = (q: string, v: number) => {
    setValues(prev => ({ ...prev, [q]: Math.max(0, Math.min(600, v)) }))
  }

  const handleSave = () => {
    onSave({
      clan: values.clan!,
      adhocracy: values.adhocracy!,
      market: values.market!,
      hierarchy: values.hierarchy!,
    })
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Distribute points across quadrants (total: {total}/600).
      </p>
      <div className="grid grid-cols-2 gap-3">
        {QUADRANTS.map(q => (
          <div key={q} className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">{LABELS[q]}</label>
            <p className="text-[10px] text-gray-400">{HINTS[q]}</p>
            <input
              type="range"
              min={0}
              max={600}
              step={10}
              value={values[q]}
              onChange={e => handleChange(q, Number(e.target.value))}
              className="w-full accent-purple-600"
            />
            <p className="text-xs text-center font-bold text-gray-700">{values[q]}</p>
          </div>
        ))}
      </div>
      {total !== 600 && (
        <p className="text-xs text-amber-600">
          Total is {total} — ideally should sum to 600 for meaningful comparison.
        </p>
      )}
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700"
        >
          Save
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
