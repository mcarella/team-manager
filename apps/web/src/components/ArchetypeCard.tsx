import { useTranslation } from 'react-i18next'
import type { LeadershipAssessment, BehavioralCoreAssessment, Archetype } from '@team-manager/shared'
import { GOLEMAN_STYLE_MOTTOS, BEHAVIOR_DETAILS } from '../lib/leadership-constants.js'
import { ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import { ARCHETYPE_DESCRIPTIONS, ARCHETYPE_PROFILES, ARCHETYPE_BEHAVIOR_PAIR, HACKMAN_LEVELS } from '../lib/archetype-profiles.js'
import ExpandableItem from './ExpandableItem.js'
import KiviatChart from './KiviatChart.js'
import BehavioralCoreSection from './BehavioralCoreSection.js'

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-800',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-800',
  peer:        'bg-blue-50 border-blue-200 text-blue-800',
  coach:       'bg-green-50 border-green-200 text-green-800',
  strategist:  'bg-purple-50 border-purple-200 text-purple-800',
}

interface Props {
  assessment: LeadershipAssessment
  /** When present, Layer 2 (Behavioral Core) sections are rendered below. */
  behavioralCore?: BehavioralCoreAssessment | undefined
  /** Org-level depth setting. 'shallow' hides Layer 2 entirely; 'deeper' shows
   *  full data when behavioralCore is provided, otherwise a placeholder CTA. */
  assessmentDepth?: 'shallow' | 'deeper'
}

export default function ArchetypeCard({ assessment, behavioralCore, assessmentDepth = 'shallow' }: Props) {
  const { t } = useTranslation(['layer1'])
  const { archetype, scores, golemansStyles } = assessment
  const accent = ARCHETYPE_ACCENTS[archetype] ?? '#6b7280'
  const colorClass = ARCHETYPE_COLORS[archetype] ?? 'bg-gray-50 border-gray-200 text-gray-800'
  const profile = ARCHETYPE_PROFILES[archetype]
  const primaryStyle = golemansStyles[0]!
  const secondaryStyle = golemansStyles[1]

  return (
    <div className={`w-full max-w-3xl rounded-2xl border-2 p-6 space-y-5 ${colorClass}`}>
      {/* Header — triad headline: archetype (OA behavior, Goleman style) */}
      <div>
        {/* Hackman team-maturity fit — this archetype performs best with X teams */}
        <div className="mb-2">
          <span
            className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/60 border whitespace-nowrap"
            style={{ borderColor: accent, color: accent }}
            title={`This archetype performs best with ${HACKMAN_LEVELS[archetype]} teams (Hackman maturity)`}
          >
            ▲ Performs best with {HACKMAN_LEVELS[archetype]} teams
          </span>
        </div>

        <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
          {t('layer1:result.eyebrow')}
        </p>
        <h2 className="text-2xl font-bold mt-0.5 leading-snug">
          {t(`layer1:result.headlineByArchetype.${archetype}`)}
        </h2>
        <p className="text-sm italic opacity-70 mt-1">{GOLEMAN_STYLE_MOTTOS[primaryStyle]}</p>
        {secondaryStyle && (
          <p className="text-sm opacity-60 mt-2">
            {t(`layer1:result.secondaryByArchetype.${archetype}`)}
          </p>
        )}
        <div className="mt-3 pt-2 border-t border-current/10">
          <p className="text-xs opacity-50">{profile.roleLabel}</p>
          <p className="mt-1 text-sm opacity-80">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
        </div>
      </div>

      {/* Leader's Skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Leader's Skills</p>
        <ul className="space-y-2">
          {profile.skills.map(item => <ExpandableItem key={item.label} {...item} />)}
        </ul>
      </div>

      {/* Characteristics */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Characteristics</p>
        <ul className="space-y-2">
          {profile.characteristics.map(item => <ExpandableItem key={item.label} {...item} />)}
        </ul>
      </div>

      {/* Behavior Scores — visualized as a 6-axis Kiviat with the archetype's
          primary + secondary behaviors highlighted on the axes. */}
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

      {/* Goleman Behavior Deep-Dive */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Leadership Styles — Attitudes & Behaviors</p>
        {golemansStyles.map(style => {
          const d = BEHAVIOR_DETAILS[style]
          return (
            <div key={style} className="bg-white/50 rounded-xl p-4 space-y-2">
              <p className="font-bold capitalize text-sm">{d.label} <span className="font-normal opacity-50 text-xs">({style})</span></p>
              <table className="w-full text-xs border-separate border-spacing-y-1">
                <tbody>
                  {[
                    { label: 'Leader Attitude',       value: d.leaderAttitude,       quoted: true },
                    { label: 'Leader Stance',         value: d.leaderStance },
                    { label: 'Work Management',       value: d.workManagement },
                    { label: 'Definition of Success', value: d.definitionOfSuccess },
                    { label: 'Motivational Style',    value: d.motivationalStyle },
                    { label: 'Group Unity',           value: d.groupUnity },
                  ].map(({ label, value, quoted }) => (
                    <tr key={label}>
                      <td className="font-semibold opacity-60 pr-3 whitespace-nowrap align-top w-32">{label}</td>
                      <td className="opacity-90">
                        {quoted ? <span className="italic">&ldquo;{value}&rdquo;</span> : value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>

      {/* Layer 2 — Behavioral Core (only when org is in 'deeper' mode) */}
      <BehavioralCoreSection
        behavioralCore={behavioralCore}
        enabled={assessmentDepth === 'deeper'}
        accent={accent}
      />
    </div>
  )
}
