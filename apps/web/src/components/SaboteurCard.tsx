import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { SaboteurId } from '@team-manager/shared'
import { getSaboteurProfile } from '@team-manager/core'

interface Props {
  saboteurId: SaboteurId
  /** Optional 0-10 score (only shown when provided). */
  score?: number
  /** Visual size — `rich` includes origin + hijacked strength + sage antidote details. */
  size?: 'compact' | 'rich'
  /** Marks this card as the user's top match (ring + accent border). */
  isCurrent?: boolean
  /**
   * If true and `size === 'compact'`, the card becomes a button that
   * toggles between compact and rich on click. Used in the "explore other
   * saboteurs" section of the result page.
   */
  expandable?: boolean
  /** Starting open state when `expandable` (default false). */
  defaultOpen?: boolean
}

/**
 * Reusable saboteur archetype card.
 * - `compact` — for lists, top-3 chip rows, future `/library/saboteurs` browsing.
 * - `rich` — for the result page top-3 expansion (origin, hijacked strength, sage antidote).
 * - With `expandable`, a compact card can be clicked to reveal the rich detail in-place.
 *
 * Theme color comes from the canonical `SABOTEUR_PROFILES` palette so radar +
 * cards stay visually consistent.
 */
export default function SaboteurCard({
  saboteurId,
  score,
  size = 'compact',
  isCurrent = false,
  expandable = false,
  defaultOpen = false,
}: Props) {
  const { t } = useTranslation(['layer3'])
  const profile = getSaboteurProfile(saboteurId)
  const accent = profile.color
  const [open, setOpen] = useState(defaultOpen)

  // When expandable, the card's internal `open` state overrides the `size` prop.
  const effectiveRich = expandable ? open : size === 'rich'
  const interactive = expandable

  return (
    <article
      className={`rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-3 ${
        isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''
      } ${interactive ? 'cursor-pointer hover:border-gray-300 transition-colors' : ''}`}
      style={isCurrent ? { '--tw-ring-color': accent } as React.CSSProperties : undefined}
      onClick={interactive ? () => setOpen(o => !o) : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={
        interactive
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen(o => !o)
              }
            }
          : undefined
      }
      aria-expanded={interactive ? open : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
            {t(`layer3:saboteurs.${saboteurId}.motto`)}
          </p>
          <h3 className={`font-bold text-gray-900 ${effectiveRich ? 'text-2xl' : 'text-lg'} leading-tight`}>
            {t(`layer3:saboteurs.${saboteurId}.name`)}
          </h3>
        </div>
        {typeof score === 'number' && (
          <div
            className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: accent }}
          >
            {score.toFixed(1)}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">
        {t(`layer3:saboteurs.${saboteurId}.tagline`)}
      </p>

      {effectiveRich && (
        <dl className="space-y-3 pt-2 border-t border-gray-100">
          <Detail label="Origin" body={t(`layer3:saboteurs.${saboteurId}.origin`)} />
          <Detail label="Hijacked strength" body={t(`layer3:saboteurs.${saboteurId}.hijackedStrength`)} />
          <Detail label="Sage antidote" body={t(`layer3:saboteurs.${saboteurId}.sageAntidote`)} accent={accent} />
        </dl>
      )}

      {interactive && (
        <p className="text-xs font-medium pt-1" style={{ color: accent }}>
          {open ? t('layer3:result.showLess') : t('layer3:result.showMore')}
        </p>
      )}
    </article>
  )
}

function Detail({ label, body, accent }: { label: string; body: string; accent?: string }) {
  return (
    <div>
      <dt
        className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
        style={accent ? { color: accent } : { color: '#6b7280' }}
      >
        {label}
      </dt>
      <dd className="text-sm text-gray-700 leading-snug">{body}</dd>
    </div>
  )
}
