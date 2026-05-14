import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  LeadershipAssessment,
  BehavioralCoreAssessment,
  BehavioralCoreFactors,
  GolemanRadar,
  GolemansStyle,
} from '@team-manager/shared'
import {
  ARCHETYPE_GOLEMAN_PAIR,
  ARCHETYPE_BEHAVIOR_PAIR,
} from '../lib/archetype-profiles.js'
import { ARCHETYPE_CARD_COLORS, ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import OAArchetypeCard from './OAArchetypeCard.js'
import Layer2ArchetypeCard from './Layer2ArchetypeCard.js'
import GolemanStyleCard from './GolemanStyleCard.js'
import KiviatChart from './KiviatChart.js'
import GolemanRadarChart from './GolemanRadarChart.js'

interface Props {
  leadership: LeadershipAssessment
  behavioralCore?: BehavioralCoreAssessment | undefined
  assessmentDepth?: 'shallow' | 'deeper'
}

const FACTOR_KEYS: Array<keyof BehavioralCoreFactors> = ['dominance', 'extraversion', 'patience', 'formality']
const GOLEMAN_STYLES: GolemansStyle[] = ['coercive', 'authoritative', 'pacesetting', 'democratic', 'coaching', 'visionary']

/**
 * Leadership recap — composes the 4 reusable cards (1 OA + 2 Goleman + 1 L2)
 * with the 3 standalone Kiviat panels interleaved between them, in this order:
 *
 *   1. OA archetype card
 *   2. Behavior Scores Kiviat (6-axis, dual-label)
 *   3. Primary Goleman style card
 *   4. Secondary Goleman style card
 *   5. Layer 2 behavioral archetype card
 *   6. Behavioral Drives Kiviat (4-axis + info chips)
 *   7. Style Distribution Kiviat (6-axis Goleman radar + dominant headline)
 *
 * The cards themselves don't render kiviats inline; they're standalone panels
 * here so the recap can sequence them deliberately.
 */
export default function LeadershipRecap({ leadership, behavioralCore, assessmentDepth = 'shallow' }: Props) {
  const { t } = useTranslation(['layer1', 'layer2'])
  const { archetype } = leadership
  const accent = ARCHETYPE_ACCENTS[archetype] ?? '#6b7280'
  const cardClass = ARCHETYPE_CARD_COLORS[archetype] ?? ''
  const [primaryStyle, secondaryStyle] = ARCHETYPE_GOLEMAN_PAIR[archetype]
  const showLayer2 = assessmentDepth === 'deeper'

  return (
    <div className="w-full space-y-4">
      {/* 1. OA archetype card (no kiviat embedded) */}
      <OAArchetypeCard archetype={archetype} size="rich" />

      {/* 2. Behavior Scores Kiviat */}
      <KiviatPanel cardClass={cardClass} accent={accent} heading="Behavior Scores">
        <KiviatChart
          axes={[
            { label: 'Catalyzing',  value: leadership.scores.catalyzing,  secondaryLabel: 'visionary' },
            { label: 'Envisioning', value: leadership.scores.envisioning, secondaryLabel: 'authoritative' },
            { label: 'Demanding',   value: leadership.scores.demanding,   secondaryLabel: 'pacesetting' },
            { label: 'Coaching',    value: leadership.scores.coaching,    secondaryLabel: 'coaching' },
            { label: 'Conducting',  value: leadership.scores.conducting,  secondaryLabel: 'democratic' },
            { label: 'Directing',   value: leadership.scores.directing,   secondaryLabel: 'coercive' },
          ]}
          fullMark={20}
          color={accent}
          highlightLabels={[...ARCHETYPE_BEHAVIOR_PAIR[archetype]]}
        />
      </KiviatPanel>

      {/* 3 + 4. Goleman style cards — main + secondary */}
      <GolemanStyleCard style={primaryStyle} size="rich" isCurrent />
      <GolemanStyleCard style={secondaryStyle} size="rich" />

      {showLayer2 && (
        behavioralCore ? (
          <>
            {/* 5. Layer 2 behavioral archetype card (no kiviats embedded) */}
            <Layer2ArchetypeCard
              profileId={behavioralCore.subProfile}
              size="rich"
              themeOverride={{ card: cardClass, accent }}
            />

            {/* 6. Behavioral Drives Kiviat (with click-to-toggle factor info) */}
            <KiviatPanel
              cardClass={cardClass}
              accent={accent}
              heading={t('layer2:result.drivesHeading')}
              footer={<p className="text-xs opacity-60">{t('layer2:result.drivesNote')}</p>}
            >
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
            </KiviatPanel>

            {/* 7. Style Distribution — Goleman radar + dominant headline */}
            <KiviatPanel
              cardClass={cardClass}
              accent={accent}
              heading={t('layer2:result.distributionHeading')}
            >
              <DominantStyleHeadline radar={behavioralCore.golemanRadar} accent={accent} />
              <GolemanRadarChart
                radar={behavioralCore.golemanRadar}
                dominantStyle={pickDominantStyle(behavioralCore.golemanRadar)}
                labels={
                  Object.fromEntries(
                    GOLEMAN_STYLES.map(s => [s, t(`layer1:golemanStyles.${s}`)]),
                  ) as Record<GolemansStyle, string>
                }
                color={accent}
              />
            </KiviatPanel>
          </>
        ) : (
          <Layer2Placeholder accent={accent} cardClass={cardClass} />
        )
      )}
    </div>
  )
}

// ── Kiviat panel — small themed card that wraps a chart ─────────────────────

function KiviatPanel({
  heading,
  cardClass,
  accent,
  footer,
  children,
}: {
  heading: string
  cardClass: string
  accent: string
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className={`rounded-2xl border-2 p-5 ${cardClass}`}>
      <p
        className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-3"
        style={{ color: accent }}
      >
        {heading}
      </p>
      <div className="bg-white/50 rounded-xl p-4">
        {children}
      </div>
      {footer && <div className="pt-3">{footer}</div>}
    </section>
  )
}

// ── Drives info chips — clickable factor names with click-to-expand description ─

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

// ── Dominant style headline above the Style Distribution radar ──────────────

function DominantStyleHeadline({ radar, accent }: { radar: GolemanRadar; accent: string }) {
  const { t } = useTranslation(['layer1', 'layer2'])
  const dominantStyle = pickDominantStyle(radar)
  const dominantLabel = t(`layer1:golemanStyles.${dominantStyle}`)
  return (
    <div className="flex flex-col items-center text-center pb-3 border-b border-current/10 mb-4">
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

// ── Placeholder when deeper mode is on but Layer 2 not yet taken ────────────

function Layer2Placeholder({ accent, cardClass }: { accent: string; cardClass: string }) {
  const { t } = useTranslation(['layer1'])
  return (
    <div className={`rounded-2xl border-2 p-6 space-y-3 ${cardClass}`}>
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
