import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type {
  BehavioralCoreFactors,
  BehavioralCoreSubProfile,
  GolemanRadar,
  GolemansStyle,
} from '@team-manager/shared'
import { SUB_PROFILES, type SubProfileGroup } from '@team-manager/core'
import KiviatChart from './KiviatChart.js'
import GolemanRadarChart from './GolemanRadarChart.js'

const FACTOR_KEYS: Array<keyof BehavioralCoreFactors> = ['dominance', 'extraversion', 'patience', 'formality']
const GOLEMAN_STYLES: GolemansStyle[] = ['coercive', 'authoritative', 'pacesetting', 'democratic', 'coaching', 'visionary']

const FACTOR_COLOR: Record<keyof BehavioralCoreFactors, string> = {
  dominance:    '#ef4444',
  extraversion: '#f59e0b',
  patience:     '#10b981',
  formality:    '#6366f1',
}

const GROUP_THEME_FALLBACK: Record<SubProfileGroup, { card: string; accent: string }> = {
  analytical:  { card: 'bg-indigo-50 border-indigo-200 text-indigo-900',    accent: '#4f46e5' },
  social:      { card: 'bg-amber-50 border-amber-200 text-amber-900',       accent: '#d97706' },
  stabilizing: { card: 'bg-emerald-50 border-emerald-200 text-emerald-900', accent: '#059669' },
  persistent:  { card: 'bg-red-50 border-red-200 text-red-900',             accent: '#dc2626' },
}

interface Props {
  profileId: BehavioralCoreSubProfile
  size?: 'compact' | 'rich'
  defaultOpen?: boolean
  isCurrent?: boolean
  /** When provided AND size='rich', renders Behavioral Drives Kiviat (replaces mini bars). */
  factors?: BehavioralCoreFactors
  /** When provided AND size='rich', renders the Style Distribution Goleman radar. */
  golemanRadar?: GolemanRadar
  /** Override the group-based theme (e.g., use the user's Layer 1 archetype color in the recap). */
  themeOverride?: { card: string; accent: string }
}

/**
 * Layer 2 (Behavioral Core) sub-profile card.
 * Two sizes:
 *  - `compact`: used on /library/archetypes — header + mini factor bars + description
 *             + toggle to reveal strengths/cautions/env/comm/roles.
 *  - `rich`: used on the leadership recap — header + Behavioral Drives Kiviat
 *           (with factor info chips) + always-expanded everything + Style Distribution.
 */
export default function Layer2ArchetypeCard({
  profileId,
  size = 'compact',
  defaultOpen = false,
  isCurrent = false,
  factors,
  golemanRadar,
  themeOverride,
}: Props) {
  const { t } = useTranslation(['layer1', 'layer2'])
  const profileMeta = SUB_PROFILES.find(p => p.id === profileId)
  const group = profileMeta?.group ?? 'stabilizing'
  const theme = themeOverride ?? GROUP_THEME_FALLBACK[group]
  const isRich = size === 'rich'
  const [open, setOpen] = useState(defaultOpen)
  const showExpanded = isRich || open

  const strengths      = t(`layer2:subProfiles.${profileId}.strengths`,     { returnObjects: true }) as string[]
  const cautions       = t(`layer2:subProfiles.${profileId}.cautions`,      { returnObjects: true }) as string[]
  const idealEnvironment   = t(`layer2:subProfiles.${profileId}.idealEnvironment`)
  const communicationStyle = t(`layer2:subProfiles.${profileId}.communicationStyle`)
  const typicalRoles   = t(`layer2:subProfiles.${profileId}.typicalRoles`, { returnObjects: true }) as string[]

  return (
    <article
      className={`rounded-2xl border-2 ${isRich ? 'p-6 space-y-5' : 'p-4 space-y-3'} ${theme.card} ${
        isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''
      }`}
      style={isCurrent ? { '--tw-ring-color': theme.accent } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          {isRich && (
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
              {t('layer2:result.eyebrow')}
            </p>
          )}
          <div className="flex items-baseline gap-3 mt-0.5">
            <span className={isRich ? 'text-3xl' : 'text-2xl'} aria-hidden>
              {t(`layer2:subProfiles.${profileId}.icon`)}
            </span>
            {isRich ? (
              <h2 className="text-2xl font-bold">{t(`layer2:subProfiles.${profileId}.name`)}</h2>
            ) : (
              <h3 className="text-lg font-bold">{t(`layer2:subProfiles.${profileId}.name`)}</h3>
            )}
          </div>
          <p className="text-xs font-medium opacity-50 mt-0.5">
            {t(`layer2:result.groupLabels.${group}`)}
            {isRich && <> · {t('layer2:result.subtitle')}</>}
          </p>
          {!isRich && (
            <p className="text-[11px] uppercase tracking-widest opacity-50 mt-0.5 font-mono">{profileId}</p>
          )}
        </div>
        {isCurrent && (
          <span
            className="shrink-0 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: theme.accent }}
          >
            ✓ Your match
          </span>
        )}
      </header>

      <p className={`opacity-90 leading-relaxed ${isRich ? 'text-sm mt-2' : 'text-sm'}`}>
        {t(`layer2:subProfiles.${profileId}.description`)}
      </p>

      {/* Centroid mini-bars (compact only) */}
      {!isRich && profileMeta && (
        <div className="space-y-1">
          {FACTOR_KEYS.map(key => {
            const value = profileMeta.centroid[key]
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider opacity-60 w-16 shrink-0">
                  {t(`layer2:result.factors.${key}`)}
                </span>
                <div className="flex-1 h-1.5 rounded-full bg-white/70 overflow-hidden relative">
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-current opacity-20" />
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${value}%`, backgroundColor: FACTOR_COLOR[key] }}
                  />
                </div>
                <span className="text-[10px] font-mono w-6 text-right opacity-70">{value}</span>
              </div>
            )
          })}
        </div>
      )}

      {/* Behavioral Drives Kiviat (rich only, requires factors) */}
      {isRich && factors && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
            {t('layer2:result.drivesHeading')}
          </p>
          <div className="bg-white/50 rounded-xl p-3">
            <KiviatChart
              axes={[
                { label: t('layer2:result.factors.dominance'),    value: factors.dominance },
                { label: t('layer2:result.factors.extraversion'), value: factors.extraversion },
                { label: t('layer2:result.factors.patience'),     value: factors.patience },
                { label: t('layer2:result.factors.formality'),    value: factors.formality },
              ]}
              fullMark={100}
              color={theme.accent}
            />
            <DrivesInfoChips accent={theme.accent} />
          </div>
          <p className="text-xs opacity-60 pt-2">{t('layer2:result.drivesNote')}</p>
        </div>
      )}

      {/* Compact mode toggle */}
      {!isRich && (
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          className="text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
          style={{ color: theme.accent }}
        >
          {open ? '▲ Hide details' : '▼ Show details'}
        </button>
      )}

      {/* Expandable: strengths, cautions, environment, communication, roles */}
      {showExpanded && (
        <div className="space-y-3 pt-2 border-t border-current/10">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.strengthsHeading')}
            </p>
            <ul className="space-y-1">
              {strengths.map(s => (
                <li key={s} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.cautionsHeading')}
            </p>
            <ul className="space-y-1">
              {cautions.map(c => (
                <li key={c} className="flex items-start gap-2 text-xs">
                  <span className="mt-1 w-1 h-1 rounded-full bg-current opacity-60 shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.idealEnvironmentHeading')}
            </p>
            <p className="text-xs opacity-90 leading-relaxed">{idealEnvironment}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.communicationStyleHeading')}
            </p>
            <p className="text-xs opacity-90 leading-relaxed">{communicationStyle}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.typicalRolesHeading')}
            </p>
            <div className="flex flex-wrap gap-1">
              {typicalRoles.map(role => (
                <span
                  key={role}
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 border border-current/15"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Style Distribution radar (rich only, requires golemanRadar) */}
      {isRich && golemanRadar && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
            {t('layer2:result.distributionHeading')}
          </p>
          <div className="bg-white/50 rounded-xl p-4 space-y-4">
            <StyleDistributionHeadline radar={golemanRadar} accent={theme.accent} t={t} />
            <GolemanRadarChart
              radar={golemanRadar}
              dominantStyle={pickDominantStyle(golemanRadar)}
              labels={
                Object.fromEntries(
                  GOLEMAN_STYLES.map(s => [s, t(`layer1:golemanStyles.${s}`)]),
                ) as Record<GolemansStyle, string>
              }
              color={theme.accent}
            />
          </div>
        </div>
      )}
    </article>
  )
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function DrivesInfoChips({ accent }: { accent: string }) {
  const { t } = useTranslation(['layer2'])
  const [openFactor, setOpenFactor] = useState<keyof BehavioralCoreFactors | null>(null)
  return (
    <div className="mt-3 space-y-2">
      <div className="flex flex-wrap gap-1.5 justify-center">
        {FACTOR_KEYS.map(key => {
          const isOpen = openFactor === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setOpenFactor(prev => prev === key ? null : key)}
              aria-expanded={isOpen}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full border transition-colors"
              style={{
                color: isOpen ? '#fff' : accent,
                backgroundColor: isOpen ? accent : 'transparent',
                borderColor: accent,
              }}
            >
              {t(`layer2:result.factors.${key}`)}
              <span className="text-[9px] opacity-80" aria-hidden>ⓘ</span>
            </button>
          )
        })}
      </div>
      {openFactor && (
        <p
          className="text-xs opacity-80 pl-3 border-l-2 leading-relaxed"
          style={{ borderColor: accent }}
        >
          <span className="font-semibold">{t(`layer2:result.factors.${openFactor}`)}:</span>{' '}
          {t(`layer2:result.factorInfo.${openFactor}`)}
        </p>
      )}
    </div>
  )
}

function StyleDistributionHeadline({
  radar,
  accent,
  t,
}: {
  radar: GolemanRadar
  accent: string
  t: ReturnType<typeof useTranslation>['t']
}) {
  const dominantStyle = pickDominantStyle(radar)
  const dominantLabel = t(`layer1:golemanStyles.${dominantStyle}`)
  return (
    <div className="flex flex-col items-center text-center pb-3 border-b border-current/10">
      <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60">
        {t('layer2:result.dominantHeading')}
      </p>
      <p className="text-2xl font-bold mt-1" style={{ color: accent }}>{dominantLabel}</p>
      <p className="text-sm italic opacity-70 mt-0.5">
        {t(`layer2:result.golemanMottos.${dominantStyle}`)}
      </p>
      <p className="text-xs opacity-60 mt-3 max-w-sm">
        {t('layer2:result.dominantNote', { style: dominantLabel })}
      </p>
    </div>
  )
}

function pickDominantStyle(radar: GolemanRadar): GolemansStyle {
  let best: GolemansStyle = GOLEMAN_STYLES[0]!
  let bestScore = -Infinity
  for (const style of GOLEMAN_STYLES) {
    if (radar[style] > bestScore) {
      bestScore = radar[style]
      best = style
    }
  }
  return best
}
