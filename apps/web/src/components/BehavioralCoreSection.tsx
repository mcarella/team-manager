import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  BehavioralCoreAssessment,
  BehavioralCoreFactors,
  GolemanRadar,
  GolemansStyle,
} from '@team-manager/shared'
import { SUB_PROFILES } from '@team-manager/core'
import GolemanRadarChart from './GolemanRadarChart.js'
import KiviatChart from './KiviatChart.js'
import ArchetypesGallery from './ArchetypesGallery.js'

interface Props {
  behavioralCore: BehavioralCoreAssessment | null | undefined
  /** When true, show the rich Layer 2 content (or placeholder if no data yet). */
  enabled: boolean
  /** Accent color from the parent (archetype theme). */
  accent: string
}

const FACTOR_KEYS: Array<keyof BehavioralCoreFactors> = ['dominance', 'extraversion', 'patience', 'formality']
const GOLEMAN_STYLES: GolemansStyle[] = ['coercive', 'authoritative', 'pacesetting', 'democratic', 'coaching', 'visionary']

export default function BehavioralCoreSection({ behavioralCore, enabled, accent }: Props) {
  const { t } = useTranslation(['layer1', 'layer2'])

  if (!enabled) return null

  // Placeholder state — depth is deeper but Layer 2 not yet taken
  if (!behavioralCore) {
    return (
      <div className="space-y-3 pt-4 border-t border-current/10">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
          {t('layer1:result.deeperSectionHeading')}
        </p>
        <div className="bg-white/40 rounded-xl p-4 border-2 border-dashed border-current/20">
          <p className="text-sm opacity-80">{t('layer1:result.deeperPlaceholderIntro')}</p>
          <ul className="text-xs opacity-70 mt-2 space-y-1 list-disc list-inside">
            <li>{t('layer1:result.deeperPlaceholder.subProfile')}</li>
            <li>{t('layer1:result.deeperPlaceholder.drives')}</li>
            <li>{t('layer1:result.deeperPlaceholder.strengths')}</li>
            <li>{t('layer1:result.deeperPlaceholder.environment')}</li>
            <li>{t('layer1:result.deeperPlaceholder.distribution')}</li>
          </ul>
          <Link
            to="/assessment/layer-2"
            className="inline-block mt-3 px-4 py-2 rounded-xl text-sm font-semibold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accent }}
          >
            {t('layer1:result.deeperCTA')}
          </Link>
          <p className="mt-3 text-xs opacity-60">
            Curious already?{' '}
            <Link to="/library/archetypes" className="font-semibold hover:underline" style={{ color: accent }}>
              Browse all 17 behavioral archetypes →
            </Link>
          </p>
        </div>
      </div>
    )
  }

  // Loaded state — full Layer 2 content
  const profileMeta = SUB_PROFILES.find(p => p.id === behavioralCore.subProfile)
  const group = profileMeta?.group ?? 'stabilizing'
  const dominantStyle = pickDominantStyle(behavioralCore.golemanRadar)
  const dominantLabel = t(`layer1:golemanStyles.${dominantStyle}`)
  const strengths = t(`layer2:subProfiles.${behavioralCore.subProfile}.strengths`, { returnObjects: true }) as string[]
  const cautions  = t(`layer2:subProfiles.${behavioralCore.subProfile}.cautions`,  { returnObjects: true }) as string[]
  const idealEnvironment   = t(`layer2:subProfiles.${behavioralCore.subProfile}.idealEnvironment`)
  const communicationStyle = t(`layer2:subProfiles.${behavioralCore.subProfile}.communicationStyle`)
  const typicalRoles       = t(`layer2:subProfiles.${behavioralCore.subProfile}.typicalRoles`, { returnObjects: true }) as string[]
  const styleLabels = Object.fromEntries(
    GOLEMAN_STYLES.map(s => [s, t(`layer1:golemanStyles.${s}`)]),
  ) as Record<GolemansStyle, string>

  return (
    <div className="space-y-5 pt-4 border-t border-current/10">
      <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
        {t('layer1:result.deeperSectionHeading')}
      </p>

      {/* Sub-profile header */}
      <div>
        <div className="flex items-baseline gap-3">
          <span className="text-2xl" aria-hidden>
            {t(`layer2:subProfiles.${behavioralCore.subProfile}.icon`)}
          </span>
          <h3 className="text-2xl font-bold">
            {t(`layer2:subProfiles.${behavioralCore.subProfile}.name`)}
          </h3>
        </div>
        <p className="text-xs font-medium opacity-50 mt-0.5">
          {t(`layer2:result.groupLabels.${group}`)} · {t('layer2:result.subtitle')}
        </p>
        <p className="mt-2 text-sm opacity-80">
          {t(`layer2:subProfiles.${behavioralCore.subProfile}.description`)}
        </p>
      </div>

      {/* Behavioral drives — visualized as a 4-axis Kiviat */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.drivesHeading')}
        </p>
        <div className="bg-white/50 rounded-xl p-3">
          <KiviatChart
            axes={[
              { label: t('layer2:result.factors.dominance'),    value: behavioralCore.factors.dominance },
              { label: t('layer2:result.factors.extraversion'), value: behavioralCore.factors.extraversion },
              { label: t('layer2:result.factors.patience'),     value: behavioralCore.factors.patience },
              { label: t('layer2:result.factors.formality'),    value: behavioralCore.factors.formality },
            ]}
            fullMark={100}
            color={accent}
          />
          <DrivesInfoChips accent={accent} />
        </div>
        <p className="text-xs opacity-60 pt-2">{t('layer2:result.drivesNote')}</p>
      </div>

      {/* Behavioral Strengths */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.strengthsHeading')}
        </p>
        <ul className="space-y-1.5">
          {strengths.map(s => (
            <li key={s} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              <span className="text-sm">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Areas for Growth */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.cautionsHeading')}
        </p>
        <ul className="space-y-1.5">
          {cautions.map(c => (
            <li key={c} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              <span className="text-sm">{c}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Ideal Environment */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.idealEnvironmentHeading')}
        </p>
        <p className="text-sm opacity-90 leading-relaxed">{idealEnvironment}</p>
      </div>

      {/* Communication Style */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.communicationStyleHeading')}
        </p>
        <p className="text-sm opacity-90 leading-relaxed">{communicationStyle}</p>
      </div>

      {/* Where they easily perform */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.typicalRolesHeading')}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {typicalRoles.map(role => (
            <span
              key={role}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-white/60 border border-current/15"
            >
              {role}
            </span>
          ))}
        </div>
      </div>

      {/* Style Distribution */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
          {t('layer2:result.distributionHeading')}
        </p>
        <div className="bg-white/50 rounded-xl p-4 space-y-4">
          <div className="flex flex-col items-center text-center pb-3 border-b border-current/10">
            <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60">
              {t('layer2:result.dominantHeading')}
            </p>
            <p className="text-2xl font-bold mt-1" style={{ color: accent }}>
              {dominantLabel}
            </p>
            <p className="text-sm italic opacity-70 mt-0.5">
              {t(`layer2:result.golemanMottos.${dominantStyle}`)}
            </p>
            <p className="text-xs opacity-60 mt-3 max-w-sm">
              {t('layer2:result.dominantNote', { style: dominantLabel })}
            </p>
          </div>
          <GolemanRadarChart
            radar={behavioralCore.golemanRadar}
            dominantStyle={dominantStyle}
            labels={styleLabels}
            color={accent}
          />
        </div>
      </div>

      {/* HIDDEN — the full archetype family inline gallery. Re-enable by uncommenting.
          Visible standalone at /library/archetypes.
          <FullFamilyToggle currentProfileId={behavioralCore.subProfile} accent={accent} />
      */}
    </div>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FullFamilyToggle({
  currentProfileId,
  accent,
}: {
  currentProfileId: BehavioralCoreAssessment['subProfile']
  accent: string
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pt-2 space-y-2">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-white/40 hover:bg-white/60 border border-current/10 transition-colors"
      >
        <div className="text-left">
          <p className="text-xs font-semibold uppercase tracking-wider opacity-70">
            The full family — 17 archetypes
          </p>
          <p className="text-xs opacity-60 mt-0.5">
            Browse the other 16. See who's in your group, who's the opposite, who you might clash with.
          </p>
        </div>
        <span className="text-xs font-semibold shrink-0" style={{ color: accent }} aria-hidden>
          {open ? '▲ Hide' : '▼ Show'}
        </span>
      </button>
      {open && (
        <div className="pt-2">
          <ArchetypesGallery currentProfileId={currentProfileId} autoExpandCurrent={false} />
        </div>
      )}
    </div>
  )
}

// ── Drives info chips — sits under the Kiviat to preserve factor explanations ─

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
              aria-label={`${t(`layer2:result.factors.${key}`)} — what does this mean?`}
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
