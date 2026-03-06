import type { LeadershipAssessment } from '@team-manager/shared'

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  expert:      'Drives results through deep expertise and high standards.',
  coordinator: 'Balances demanding pace with structured collaboration.',
  peer:        'Empowers the team through democratic facilitation.',
  coach:       'Develops people through guidance and catalyzing vision.',
  strategist:  'Shapes the future by inspiring systemic thinking.',
}

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-800',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-800',
  peer:        'bg-blue-50 border-blue-200 text-blue-800',
  coach:       'bg-green-50 border-green-200 text-green-800',
  strategist:  'bg-purple-50 border-purple-200 text-purple-800',
}

interface Props {
  assessment: LeadershipAssessment
}

export default function ArchetypeCard({ assessment }: Props) {
  const { archetype, scores, golemansStyles } = assessment
  const colorClass = ARCHETYPE_COLORS[archetype] ?? 'bg-gray-50 border-gray-200 text-gray-800'

  return (
    <div className={`w-full max-w-lg rounded-2xl border-2 p-6 space-y-4 ${colorClass}`}>
      <div>
        <p className="text-sm font-medium uppercase tracking-widest opacity-60">Your Archetype</p>
        <h2 className="text-3xl font-bold capitalize">{archetype}</h2>
        <p className="mt-1 text-sm opacity-80">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Behavior Scores</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(scores).map(([behavior, score]) => (
            <div key={behavior} className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-1.5">
              <span className="text-sm capitalize">{behavior}</span>
              <span className="font-bold text-sm">{score}/20</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Goleman Styles</p>
        <div className="flex flex-wrap gap-2">
          {golemansStyles.map(style => (
            <span key={style} className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium capitalize">
              {style}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
