import type { CVFCategory } from '@team-manager/shared'

interface CategoryDef {
  title: string
  questions: Record<keyof CVFCategory, string>
}

const CATEGORIES: CategoryDef[] = [
  {
    title: 'How do you see the organization?',
    questions: {
      clan:      'People share a lot about themselves. There are also many casual conversations making the workplace funny and lightweight.',
      adhocracy: 'People are encouraged to act as entrepreneurs and changemakers, taking risks and making their opinions stand out.',
      market:    'The company is very results-oriented. The main focus is getting the stuff done. People are competitive and achievement-oriented.',
      hierarchy: 'The company is very controlled and structured. Formal processes, policies and procedures govern what people do.',
    },
  },
  {
    title: 'How do you see the leaders?',
    questions: {
      clan:      'The leaders are role models for mentoring and facilitating.',
      adhocracy: 'The leaders are role models for taking risks and innovating.',
      market:    'The leaders are very result-oriented, sometimes pushy, and very reactive rather than reflective.',
      hierarchy: 'The leaders are focused on coordinating things, organising them properly to foster smooth-running efficiency.',
    },
  },
  {
    title: 'What reflects most the employee management?',
    questions: {
      clan:      'Teamwork, consensus and participation.',
      adhocracy: 'Individual risk-taking, innovation, freedom and uniqueness.',
      market:    'Fast releases, competitiveness, high demands, goals and achievement.',
      hierarchy: 'Conformity, predictability and stability in procedures, policies and way of working.',
    },
  },
  {
    title: 'What holds things together?',
    questions: {
      clan:      'Loyalty and mutual trust along with commitment.',
      adhocracy: 'Innovation and development. Being on the cutting edge.',
      market:    'Goal reached, accomplishments, deliveries.',
      hierarchy: 'Formal rules and policies. Staying on time, on track, on budget.',
    },
  },
  {
    title: 'What boosts the organization?',
    questions: {
      clan:      'Human development. Trust, openness, inclusive participation.',
      adhocracy: 'New hires, new challenges. New things, new technologies and opportunities.',
      market:    'Hit targets. Respect milestones, strike the market and outpace competitors.',
      hierarchy: 'Permanence and stability. Efficiency, control and smooth operations.',
    },
  },
  {
    title: 'The company definition of success',
    questions: {
      clan:      'The development of people, teamwork, employee commitment and concern for people.',
      adhocracy: 'Having unique or the newest products. We are product leaders and cutting-edge innovators.',
      market:    'Winning in the marketplace and outpacing the competition. Competitive market leadership is key.',
      hierarchy: 'Efficiency. Smooth scheduling and low-cost production.',
    },
  },
]

const QUADRANT_STYLE: Record<keyof CVFCategory, { border: string; bg: string; label: string }> = {
  clan:      { border: 'border-green-300  focus:ring-green-400',  bg: 'bg-green-50',  label: 'Clan' },
  adhocracy: { border: 'border-yellow-300 focus:ring-yellow-400', bg: 'bg-yellow-50', label: 'Adhocracy' },
  market:    { border: 'border-red-300    focus:ring-red-400',    bg: 'bg-red-50',    label: 'Market' },
  hierarchy: { border: 'border-blue-300  focus:ring-blue-400',   bg: 'bg-blue-50',  label: 'Hierarchy' },
}

const QUADRANTS: (keyof CVFCategory)[] = ['clan', 'adhocracy', 'market', 'hierarchy']

interface Props {
  index: number
  value: CVFCategory
  onChange: (value: CVFCategory) => void
}

export default function CVFCategoryRow({ index, value, onChange }: Props) {
  const category = CATEGORIES[index]!
  const total = QUADRANTS.reduce((s, q) => s + value[q], 0)
  const isValid = total === 100

  const handleChange = (quadrant: keyof CVFCategory, raw: string) => {
    const num = Math.max(0, Math.min(100, Number(raw) || 0))
    onChange({ ...value, [quadrant]: num })
  }

  return (
    <div className="space-y-3">
      {/* Question title + sum badge */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-800">
          <span className="text-gray-400 mr-1.5">{index + 1}.</span>
          {category.title}
        </h3>
        <span className={`shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full ${
          isValid
            ? 'bg-green-100 text-green-700'
            : total > 100
            ? 'bg-red-100 text-red-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          {isValid ? '✓ 100' : `${total}/100`}
        </span>
      </div>

      {/* 4 quadrant rows */}
      <div className="space-y-2">
        {QUADRANTS.map(q => {
          const { border, bg, label } = QUADRANT_STYLE[q]
          return (
            <div key={q} className={`flex items-start gap-3 rounded-lg border ${border} ${bg} px-3 py-2`}>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
                <p className="text-xs text-gray-700 mt-0.5 leading-snug">{category.questions[q]}</p>
              </div>
              <input
                type="number"
                min={0}
                max={100}
                value={value[q]}
                onChange={e => handleChange(q, e.target.value)}
                className={`w-16 shrink-0 text-center border-2 rounded-lg px-1 py-1.5 text-sm font-bold focus:outline-none focus:ring-2 bg-white ${border}`}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export const CATEGORY_LABELS = CATEGORIES.map(c => c.title)
