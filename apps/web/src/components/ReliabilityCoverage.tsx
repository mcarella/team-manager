import type { ProfileReliability } from '@team-manager/shared'

function coverageBarColor(pct: number): string {
  if (pct <= 10)  return 'bg-red-500'
  if (pct < 50)   return 'bg-orange-400'
  if (pct < 80)   return 'bg-yellow-400'
  return 'bg-green-500'
}

function coveragePillColor(pct: number): string {
  if (pct <= 10)  return 'bg-red-100 text-red-700'
  if (pct < 50)   return 'bg-orange-100 text-orange-700'
  if (pct < 80)   return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

interface Props {
  reliability: ProfileReliability
  full?: boolean
}

export default function ReliabilityCoverage({ reliability, full = false }: Props) {
  const { evaluators, peers, coverage } = reliability
  const pct = Math.round(coverage * 100)

  if (!full) {
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${coveragePillColor(pct)}`}>
        {pct}%{peers > 0 && ` · ${evaluators}/${peers}`}
      </span>
    )
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">
          Peer coverage — <span className="font-semibold text-gray-700">{evaluators}/{peers}</span> evaluators
        </span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${coveragePillColor(pct)}`}>
          {pct}%
        </span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${coverageBarColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs text-gray-400">
        {peers === 0
          ? 'No peers in team — coverage not applicable'
          : `${pct}% of teammates have evaluated this person's skills`}
      </p>
    </div>
  )
}
