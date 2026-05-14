import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Archetype } from '@team-manager/shared'
import {
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_PROFILES,
  HACKMAN_LEVELS,
  ARCHETYPE_GOLEMAN_PAIR,
  ARCHETYPE_ORDER,
} from '../lib/archetype-profiles.js'
import { ARCHETYPE_CARD_COLORS, ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import { GOLEMAN_STYLE_MOTTOS } from '../lib/leadership-constants.js'
import ExpandableItem from './ExpandableItem.js'

interface Props {
  /** Highlight this archetype as "your match" with a ring + badge. */
  currentArchetype?: Archetype
  /** Auto-expand the matching archetype's details on first render. */
  autoExpandCurrent?: boolean
}

export default function OAArchetypesGallery({ currentArchetype, autoExpandCurrent = false }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ARCHETYPE_ORDER.map(archetype => (
        <ArchetypeCardSmall
          key={archetype}
          archetype={archetype}
          isCurrent={currentArchetype === archetype}
          defaultOpen={autoExpandCurrent && currentArchetype === archetype}
        />
      ))}
    </div>
  )
}

// ── Archetype Card ───────────────────────────────────────────────────────────

function ArchetypeCardSmall({
  archetype,
  isCurrent,
  defaultOpen,
}: {
  archetype: Archetype
  isCurrent: boolean
  defaultOpen: boolean
}) {
  const { t } = useTranslation(['layer1'])
  const [open, setOpen] = useState(defaultOpen)
  const profile = ARCHETYPE_PROFILES[archetype]
  const card = ARCHETYPE_CARD_COLORS[archetype] ?? 'bg-gray-50 border-gray-200 text-gray-900'
  const accent = ARCHETYPE_ACCENTS[archetype] ?? '#6b7280'
  const [primaryStyle, secondaryStyle] = ARCHETYPE_GOLEMAN_PAIR[archetype]

  return (
    <article
      className={`rounded-2xl border-2 p-4 space-y-3 ${card} ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''}`}
      style={isCurrent ? { '--tw-ring-color': accent } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-lg font-bold leading-snug">
            {t(`layer1:result.triads.${archetype}`)}
          </h3>
          <p className="text-xs font-medium opacity-50 mt-0.5">
            {profile.roleLabel}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          {isCurrent && (
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
              style={{ backgroundColor: accent }}
            >
              ✓ Your match
            </span>
          )}
          <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 whitespace-nowrap">
            {HACKMAN_LEVELS[archetype]}
          </span>
        </div>
      </header>

      {/* Description */}
      <p className="text-sm opacity-90 leading-relaxed">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>

      {/* Goleman pair */}
      <div className="space-y-1 text-xs">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold opacity-60 w-20 shrink-0">Primary</span>
          <span className="capitalize font-semibold">{primaryStyle}</span>
          <span className="italic opacity-70">{GOLEMAN_STYLE_MOTTOS[primaryStyle]}</span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold opacity-60 w-20 shrink-0">Secondary</span>
          <span className="capitalize font-semibold">{secondaryStyle}</span>
          <span className="italic opacity-70">{GOLEMAN_STYLE_MOTTOS[secondaryStyle]}</span>
        </div>
      </div>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
        style={{ color: accent }}
      >
        {open ? '▲ Hide details' : '▼ Show details'}
      </button>

      {/* Expanded content — Leader's Skills + Characteristics */}
      {open && (
        <div className="space-y-3 pt-2 border-t border-current/10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              Leader&apos;s Skills
            </p>
            <ul className="space-y-1">
              {profile.skills.map(item => <ExpandableItem key={item.label} {...item} />)}
            </ul>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              Characteristics
            </p>
            <ul className="space-y-1">
              {profile.characteristics.map(item => <ExpandableItem key={item.label} {...item} />)}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}
