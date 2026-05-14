import type { GolemansStyle } from '@team-manager/shared'
import { GOLEMAN_STYLE_MOTTOS, BEHAVIOR_DETAILS, GOLEMAN_TO_BEHAVIOR_LABEL } from '../lib/leadership-constants.js'

const STYLE_THEME: Record<GolemansStyle, { card: string; accent: string }> = {
  coercive:      { card: 'bg-red-50 border-red-200 text-red-900',           accent: '#dc2626' },
  pacesetting:   { card: 'bg-orange-50 border-orange-200 text-orange-900',  accent: '#ea580c' },
  democratic:    { card: 'bg-blue-50 border-blue-200 text-blue-900',        accent: '#2563eb' },
  coaching:      { card: 'bg-green-50 border-green-200 text-green-900',     accent: '#16a34a' },
  visionary:     { card: 'bg-purple-50 border-purple-200 text-purple-900',  accent: '#9333ea' },
  authoritative: { card: 'bg-sky-50 border-sky-200 text-sky-900',           accent: '#0284c7' },
}

const DEEP_DIVE_ROWS: Array<{ key: keyof typeof BEHAVIOR_DETAILS['visionary']; label: string }> = [
  { key: 'leaderAttitude',      label: 'Leader Attitude' },
  { key: 'leaderStance',        label: 'Leader Stance' },
  { key: 'workManagement',      label: 'Work Management' },
  { key: 'definitionOfSuccess', label: 'Definition of Success' },
  { key: 'motivationalStyle',   label: 'Motivational Style' },
  { key: 'groupUnity',          label: 'Group Unity' },
]

interface Props {
  style: GolemansStyle
  size?: 'compact' | 'rich'
  isCurrent?: boolean
}

/**
 * Goleman leadership style card with the 6-row deep-dive table.
 * Same shape in both modes; rich just bumps padding + typography to match the
 * leadership recap context.
 */
export default function GolemanStyleCard({ style, size = 'compact', isCurrent = false }: Props) {
  const d = BEHAVIOR_DETAILS[style]
  const theme = STYLE_THEME[style]
  const behaviorLabel = GOLEMAN_TO_BEHAVIOR_LABEL[style] ?? ''
  const isRich = size === 'rich'

  return (
    <article
      className={`rounded-2xl border-2 ${isRich ? 'p-6 space-y-4' : 'p-5 space-y-4'} ${theme.card} ${
        isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''
      }`}
      style={isCurrent ? { '--tw-ring-color': theme.accent } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {isRich ? (
            <h2 className="text-2xl font-bold capitalize leading-tight">
              {style}
              <span className="text-sm font-normal opacity-60 ml-2">({behaviorLabel})</span>
            </h2>
          ) : (
            <h3 className="text-xl font-bold capitalize leading-tight">
              {style}
              <span className="text-sm font-normal opacity-60 ml-2">({behaviorLabel})</span>
            </h3>
          )}
          <p className="text-sm italic opacity-70 mt-1">{GOLEMAN_STYLE_MOTTOS[style]}</p>
        </div>
        {isCurrent && (
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: theme.accent }}
          >
            ✓ Your style
          </span>
        )}
      </header>

      {/* Deep-dive table */}
      <div className="bg-white/50 rounded-xl p-4">
        <table className="w-full text-xs border-separate border-spacing-y-1">
          <tbody>
            {DEEP_DIVE_ROWS.map(({ key, label }) => (
              <tr key={key}>
                <td className="font-semibold opacity-60 pr-3 whitespace-nowrap align-top w-36">
                  {label}
                </td>
                <td className="opacity-90">
                  {key === 'leaderAttitude'
                    ? <span className="italic">&ldquo;{d[key]}&rdquo;</span>
                    : d[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
