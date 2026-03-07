import type { ProfileReliability } from '@team-manager/shared'

const STATUS_BADGE: Record<string, string> = {
  reliable: 'bg-green-100 text-green-700',
  partial:  'bg-amber-100 text-amber-700',
  none:     'bg-gray-100 text-gray-500',
}
const STATUS_LABEL: Record<string, string> = {
  reliable: '✅ Reliable',
  partial:  '⚠️ Partial',
  none:     '❌ No data',
}
const BAR_COLOR: Record<string, string> = {
  reliable: 'bg-green-500',
  partial:  'bg-amber-400',
  none:     'bg-gray-300',
}

interface Props {
  reliability: ProfileReliability
  /** Show full bar + label (default: false = compact pill only) */
  full?: boolean
}

export default function ReliabilityCoverage({ reliability, full = false }: Props) {
  const { evaluators, peers, coverage, status } = reliability

  if (!full) {
    // Compact pill for list rows / modal
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>
        {STATUS_LABEL[status]}
        {peers > 0 && ` · ${evaluators}/${peers}`}
      </span>
    )
  }

  // Full bar for detail views
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Peer coverage — <span className="font-semibold text-gray-700">{evaluators}/{peers}</span> evaluators
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[status]}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${BAR_COLOR[status]}`}
          style={{ width: `${Math.round(coverage * 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {peers === 0
          ? 'No peers in team — coverage not applicable'
          : `${Math.round(coverage * 100)}% of teammates have evaluated this person's skills`}
      </p>
    </div>
  )
}
