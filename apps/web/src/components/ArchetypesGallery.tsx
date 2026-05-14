import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { BehavioralCoreSubProfile } from '@team-manager/shared'
import { SUB_PROFILES, type SubProfileGroup, type SubProfileCentroid } from '@team-manager/core'

const GROUP_ORDER: SubProfileGroup[] = ['analytical', 'social', 'stabilizing', 'persistent']

const GROUP_THEME: Record<SubProfileGroup, { card: string; accent: string }> = {
  analytical:  { card: 'bg-indigo-50 border-indigo-200 text-indigo-900',    accent: '#4f46e5' },
  social:      { card: 'bg-amber-50 border-amber-200 text-amber-900',       accent: '#d97706' },
  stabilizing: { card: 'bg-emerald-50 border-emerald-200 text-emerald-900', accent: '#059669' },
  persistent:  { card: 'bg-red-50 border-red-200 text-red-900',             accent: '#dc2626' },
}

const FACTOR_COLOR: Record<'dominance' | 'extraversion' | 'patience' | 'formality', string> = {
  dominance:    '#ef4444',
  extraversion: '#f59e0b',
  patience:     '#10b981',
  formality:    '#6366f1',
}

const FACTOR_KEYS = ['dominance', 'extraversion', 'patience', 'formality'] as const

const GROUP_DESCRIPTIONS: Record<SubProfileGroup, string> = {
  analytical:  'Driven by results, structure, and data. Thrives on precision and depth.',
  social:      'Energized by people and influence. Thrives on communication and relationships.',
  stabilizing: 'Anchored by steadiness and consistency. Thrives on reliability and care.',
  persistent:  'Driven by autonomy and intellectual depth. Thrives working independently on high standards.',
}

interface Props {
  /** Highlight this profile id as "your match" with a ring + badge. */
  currentProfileId?: BehavioralCoreSubProfile
  /** Auto-expand the matching profile's details on first render. */
  autoExpandCurrent?: boolean
}

export default function ArchetypesGallery({ currentProfileId, autoExpandCurrent = false }: Props) {
  const { t } = useTranslation(['layer2'])

  return (
    <div className="space-y-6">
      {GROUP_ORDER.map(group => {
        const profiles = SUB_PROFILES.filter(p => p.group === group)
        const theme = GROUP_THEME[group]
        return (
          <section key={group} className="space-y-2">
            <div>
              <h3 className="text-base font-bold capitalize" style={{ color: theme.accent }}>
                {t(`layer2:result.groupLabels.${group}`)}{' '}
                <span className="text-xs font-medium opacity-60">· {profiles.length}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{GROUP_DESCRIPTIONS[group]}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profiles.map(profile => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  theme={theme}
                  isCurrent={currentProfileId === profile.id}
                  defaultOpen={autoExpandCurrent && currentProfileId === profile.id}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// ── Profile Card ─────────────────────────────────────────────────────────────

function ProfileCard({
  profile,
  theme,
  isCurrent,
  defaultOpen,
}: {
  profile: SubProfileCentroid
  theme: { card: string; accent: string }
  isCurrent: boolean
  defaultOpen: boolean
}) {
  const { t } = useTranslation(['layer2'])
  const [open, setOpen] = useState(defaultOpen)
  const strengths = t(`layer2:subProfiles.${profile.id}.strengths`, { returnObjects: true }) as string[]
  const cautions  = t(`layer2:subProfiles.${profile.id}.cautions`,  { returnObjects: true }) as string[]
  const typicalRoles = t(`layer2:subProfiles.${profile.id}.typicalRoles`, { returnObjects: true }) as string[]

  return (
    <article
      className={`rounded-2xl border-2 p-4 space-y-3 ${theme.card} ${isCurrent ? 'ring-2 ring-offset-2 ring-offset-white' : ''}`}
      style={isCurrent ? { '--tw-ring-color': theme.accent } as React.CSSProperties : undefined}
    >
      {/* Header */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl" aria-hidden>
              {t(`layer2:subProfiles.${profile.id}.icon`)}
            </span>
            <h3 className="text-lg font-bold">
              {t(`layer2:subProfiles.${profile.id}.name`)}
            </h3>
          </div>
          <p className="text-[11px] uppercase tracking-widest opacity-50 mt-0.5 font-mono">
            {profile.id}
          </p>
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

      {/* Centroid mini-bars */}
      <div className="space-y-1">
        {FACTOR_KEYS.map(key => {
          const value = profile.centroid[key]
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

      {/* Description */}
      <p className="text-sm opacity-90 leading-relaxed">
        {t(`layer2:subProfiles.${profile.id}.description`)}
      </p>

      {/* Toggle */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="text-xs font-semibold opacity-80 hover:opacity-100 transition-opacity"
        style={{ color: theme.accent }}
      >
        {open ? '▲ Hide details' : '▼ Show details'}
      </button>

      {/* Expanded content */}
      {open && (
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
            <p className="text-xs opacity-90 leading-relaxed">
              {t(`layer2:subProfiles.${profile.id}.idealEnvironment`)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider opacity-60 mb-1">
              {t('layer2:result.communicationStyleHeading')}
            </p>
            <p className="text-xs opacity-90 leading-relaxed">
              {t(`layer2:subProfiles.${profile.id}.communicationStyle`)}
            </p>
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
    </article>
  )
}
