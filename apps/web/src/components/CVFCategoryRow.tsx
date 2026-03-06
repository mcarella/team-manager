import type { CVFCategory } from '@team-manager/shared'

const CATEGORY_LABELS = [
  'Dominant Characteristics',
  'Organisational Leadership',
  'Management of Employees',
  'Organisation Glue',
  'Strategic Emphases',
  'Criteria of Success',
]

const QUADRANT_COLORS: Record<keyof CVFCategory, string> = {
  clan:      'border-green-300 focus:ring-green-400',
  adhocracy: 'border-yellow-300 focus:ring-yellow-400',
  market:    'border-red-300 focus:ring-red-400',
  hierarchy: 'border-blue-300 focus:ring-blue-400',
}

const QUADRANT_LABELS: Record<keyof CVFCategory, string> = {
  clan:      'Clan',
  adhocracy: 'Adhocracy',
  market:    'Market',
  hierarchy: 'Hierarchy',
}

interface Props {
  index: number
  value: CVFCategory
  onChange: (value: CVFCategory) => void
}

export default function CVFCategoryRow({ index, value, onChange }: Props) {
  const total = value.clan + value.adhocracy + value.market + value.hierarchy
  const isValid = total === 100
  const remaining = 100 - total

  const handleChange = (quadrant: keyof CVFCategory, raw: string) => {
    const num = Math.max(0, Math.min(100, Number(raw) || 0))
    onChange({ ...value, [quadrant]: num })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          <span className="text-gray-400 mr-1">{index + 1}.</span>
          {CATEGORY_LABELS[index]}
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
          isValid
            ? 'bg-green-100 text-green-700'
            : remaining > 0
            ? 'bg-amber-100 text-amber-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {isValid ? '✓ 100' : `${total}/100`}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {(Object.keys(QUADRANT_LABELS) as (keyof CVFCategory)[]).map(q => (
          <div key={q} className="flex flex-col items-center gap-1">
            <label className="text-xs text-gray-500">{QUADRANT_LABELS[q]}</label>
            <input
              type="number"
              min={0}
              max={100}
              value={value[q]}
              onChange={e => handleChange(q, e.target.value)}
              className={`w-full text-center border-2 rounded-lg px-2 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 ${QUADRANT_COLORS[q]}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export { CATEGORY_LABELS }
