import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { Archetype, LeadershipScores } from '@team-manager/shared'
import {
  ARCHETYPE_DESCRIPTIONS,
  ARCHETYPE_PROFILES,
  HACKMAN_LEVELS,
  ARCHETYPE_GOLEMAN_PAIR,
  ARCHETYPE_BEHAVIOR_PAIR,
} from '../lib/archetype-profiles.js'
import { ARCHETYPE_CARD_COLORS, ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import { GOLEMAN_STYLE_MOTTOS } from '../lib/leadership-constants.js'
import ExpandableItem from './ExpandableItem.js'
import KiviatChart from './KiviatChart.js'

interface Props {
  archetype: Archetype
  /** 'compact' for library browsing, 'rich' for the user's recap page. */
  size?: 'compact' | 'rich'
  /** Initial open state for the expandable details (only respected in compact mode;
   *  rich mode is always expanded). */
  defaultOpen?: boolean
  /** Marks this card as the user's matched archetype (ring + "Your match" badge). */
  isCurrent?: boolean
  /** When provided AND size='rich', renders the Behavior Scores Kiviat. */
  scores?: LeadershipScores
}

/**
 * Layer 1 (ORGANIC Agility) archetype card.
 * Two sizes:
 *  - `compact`: used on /library/archetypes — small h3, toggleable expandable lists.
 *  - `rich`: used on the leadership recap — eyebrow + h2, motto, secondary line,
 *           Behavior Scores Kiviat (if scores provided), always-expanded skills.
 */
export default function OAArchetypeCard({
  archetype,
  size = 'compact',
  defaultOpen = false,
  isCurrent = false,
  scores,
}: Props) {
  const { t } = useTranslation(['layer1'])
  const profile = ARCHETYPE_PROFILES[archetype]
  const card = ARCHETYPE_CARD_COLORS[archetype] ?? 'bg-gray-50 border-gray-200 text-gray-900'
  const accent = ARCHETYPE_ACCENTS[archetype] ?? '#6b7280'
  const [primaryStyle, secondaryStyle] = ARCHETYPE_GOLEMAN_PAIR[archetype]
  const isRich = size === 'rich'
  const [open, setOpen] = useState(defaultOpen)
  const showExpanded = isRich || open

  return (
    <article
      className={`rounded-2xl border-2 ${isRich ? 'p-6 space-y-5' : 'p-4 space-y-3'} ${card} ${
        isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''
      }`}
      style={isCurrent ? { '--tw-ring-color': accent } as React.CSSProperties : undefined}
    >
      {/* Rich-mode Hackman pill at the very top */}
      {isRich && (
        <div>
          <span
            className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/60 border whitespace-nowrap"
            style={{ borderColor: accent, color: accent }}
            title={`This archetype performs best with ${HACKMAN_LEVELS[archetype]} teams (Hackman maturity)`}
          >
            ▲ Performs best with {HACKMAN_LEVELS[archetype]} teams
          </span>
        </div>
      )}

      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isRich && (
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
              {t('layer1:result.eyebrow')}
            </p>
          )}
          {isRich ? (
            <h2 className="text-2xl font-bold leading-snug mt-0.5">
              {t(`layer1:result.headlineByArchetype.${archetype}`)}
            </h2>
          ) : (
            <h3 className="text-lg font-bold leading-snug">
              {t(`layer1:result.triads.${archetype}`)}
            </h3>
          )}
          {isRich && (
            <>
              <p className="text-sm italic opacity-70 mt-1">{GOLEMAN_STYLE_MOTTOS[primaryStyle]}</p>
              <p className="text-sm opacity-60 mt-2">
                {t(`layer1:result.secondaryByArchetype.${archetype}`)}
              </p>
            </>
          )}
          {!isRich && (
            <p className="text-xs font-medium opacity-50 mt-0.5">{profile.roleLabel}</p>
          )}
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
          {!isRich && (
            <span className="text-[10px] font-semibold uppercase tracking-wider opacity-60 whitespace-nowrap">
              {HACKMAN_LEVELS[archetype]}
            </span>
          )}
        </div>
      </header>

      {/* Rich mode: divider + role label + description (mirrors old ArchetypeCard header rhythm) */}
      {isRich && (
        <div className="pt-2 border-t border-current/10">
          <p className="text-xs opacity-50">{profile.roleLabel}</p>
          <p className="mt-1 text-sm opacity-80">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
        </div>
      )}

      {/* Compact mode: description */}
      {!isRich && (
        <p className="text-sm opacity-90 leading-relaxed">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
      )}

      {/* Compact mode: Goleman pair text block */}
      {!isRich && (
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
      )}

      {/* Behavior Scores Kiviat — rich mode only, needs scores */}
      {isRich && scores && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Behavior Scores</p>
          <div className="bg-white/50 rounded-xl p-3">
            <KiviatChart
              axes={[
                { label: 'Catalyzing',  value: scores.catalyzing,  secondaryLabel: 'visionary' },
                { label: 'Envisioning', value: scores.envisioning, secondaryLabel: 'authoritative' },
                { label: 'Demanding',   value: scores.demanding,   secondaryLabel: 'pacesetting' },
                { label: 'Coaching',    value: scores.coaching,    secondaryLabel: 'coaching' },
                { label: 'Conducting',  value: scores.conducting,  secondaryLabel: 'democratic' },
                { label: 'Directing',   value: scores.directing,   secondaryLabel: 'coercive' },
              ]}
              fullMark={20}
              color={accent}
              highlightLabels={[...ARCHETYPE_BEHAVIOR_PAIR[archetype]]}
            />
          </div>
        </div>
      )}

      {/* Compact mode toggle */}
      {!isRich && (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: accent }}
        >
          {open ? '▲ Hide details' : '▼ Show details'}
        </button>
      )}

      {/* Expandable: Leader's Skills + Characteristics */}
      {showExpanded && (
        <div className={`space-y-3 ${isRich ? 'pt-3 border-t border-current/10' : 'pt-2 border-t border-current/10'}`}>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Leader&apos;s Skills
            </p>
            <ul className="space-y-2">
              {profile.skills.map(item => <ExpandableItem key={item.label} {...item} />)}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              Characteristics
            </p>
            <ul className="space-y-2">
              {profile.characteristics.map(item => <ExpandableItem key={item.label} {...item} />)}
            </ul>
          </div>
        </div>
      )}
    </article>
  )
}
