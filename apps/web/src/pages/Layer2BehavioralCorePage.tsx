import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  BehavioralCoreAssessment,
  BehavioralCoreFactors,
  GolemanRadar,
  GolemansStyle,
  Archetype,
  LeadershipScores,
} from '@team-manager/shared'
import { ADJECTIVES, SUB_PROFILES, type SubProfileGroup } from '@team-manager/core'
import { useStore } from '../store/index.js'
import { API_BASE } from '../lib/api.js'
import { BEHAVIOR_DETAILS, GOLEMAN_STYLE_MOTTOS } from '../lib/leadership-constants.js'
import { ARCHETYPE_CARD_COLORS, ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import TimeBudgetChip from '../components/TimeBudgetChip.js'
import GolemanRadarChart from '../components/GolemanRadarChart.js'

type Phase = 'selfConcept' | 'self' | 'submitting' | 'result'

type AlignmentVerdict = 'aligned' | 'softMismatch' | 'stretching'

const FACTOR_KEYS: Array<keyof BehavioralCoreFactors> = ['dominance', 'extraversion', 'patience', 'formality']

const GOLEMAN_STYLES: GolemansStyle[] = ['coercive', 'authoritative', 'pacesetting', 'democratic', 'coaching', 'visionary']

// Fallback theme — used only when the user hasn't taken Layer 1 yet.
// When Layer 1 exists we mirror the archetype color from `ArchetypeCard` so
// Layer 2 visually reads as a refinement of the same person, not a separate app.
const GROUP_THEME_FALLBACK: Record<SubProfileGroup, { card: string; accent: string }> = {
  analytical:  { card: 'bg-indigo-50 border-indigo-200 text-indigo-900',    accent: '#4f46e5' },
  social:      { card: 'bg-amber-50 border-amber-200 text-amber-900',      accent: '#d97706' },
  stabilizing: { card: 'bg-emerald-50 border-emerald-200 text-emerald-900', accent: '#059669' },
  persistent:  { card: 'bg-red-50 border-red-200 text-red-900',            accent: '#dc2626' },
}

function pickTheme(layer1Archetype: Archetype | undefined, group: SubProfileGroup): { card: string; accent: string } {
  if (layer1Archetype) {
    return {
      card: ARCHETYPE_CARD_COLORS[layer1Archetype] ?? GROUP_THEME_FALLBACK[group].card,
      accent: ARCHETYPE_ACCENTS[layer1Archetype] ?? GROUP_THEME_FALLBACK[group].accent,
    }
  }
  return GROUP_THEME_FALLBACK[group]
}

const DEEP_DIVE_FIELDS = [
  'leaderAttitude',
  'leaderStance',
  'workManagement',
  'definitionOfSuccess',
  'motivationalStyle',
  'groupUnity',
] as const

// Minimum picks per pass. The 86-adjective instrument produces meaningful
// per-factor signal once a user has committed to ~15+ choices. Below this
// threshold the factor sums stay near zero and the matcher always lands on
// camaleonte (the centroid at 50/50/50/50), which is the "always The Adapter"
// failure mode users complain about.
const MIN_SELECTIONS_PER_PASS = 15

// Shuffle adjectives once per page-mount to mitigate selection-order bias.
function useShuffledAdjectives() {
  return useMemo(() => {
    const copy = [...ADJECTIVES]
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
    }
    return copy
  }, [])
}

export default function Layer2BehavioralCorePage() {
  const { t } = useTranslation(['layer2', 'layer1'])
  const navigate = useNavigate()
  const { currentUserId, members, saveBehavioralCoreAssessment } = useStore()

  const userId = currentUserId ?? ''
  if (!userId) { navigate('/', { replace: true }); return null }

  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.behavioralCore

  const [phase, setPhase] = useState<Phase>(existingAssessment ? 'result' : 'selfConcept')
  const [selfConcept, setSelfConcept] = useState<Set<string>>(new Set())
  const [self, setSelf] = useState<Set<string>>(new Set())
  const [result, setResult] = useState<BehavioralCoreAssessment | null>(existingAssessment ?? null)
  const [error, setError] = useState<string | null>(null)
  const [showDiff, setShowDiff] = useState(false)

  const adjectives = useShuffledAdjectives()

  const toggleAdjective = (id: string) => {
    const setter = phase === 'selfConcept' ? setSelfConcept : setSelf
    setter(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSubmit = async () => {
    setPhase('submitting')
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/assessments/behavioral-core`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          answers: { selfConcept: [...selfConcept], self: [...self] },
        }),
      })
      if (!res.ok) throw new Error(`Server returned ${res.status}`)
      const data = (await res.json()) as BehavioralCoreAssessment
      // Re-hydrate completedAt as Date (it arrives as ISO string over JSON)
      const assessment: BehavioralCoreAssessment = { ...data, completedAt: new Date(data.completedAt) }
      saveBehavioralCoreAssessment(assessment)
      setResult(assessment)
      setPhase('result')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed')
      setPhase('self') // back to last form phase
    }
  }

  const handleRetake = () => {
    setResult(null)
    setSelfConcept(new Set())
    setSelf(new Set())
    setError(null)
    setShowDiff(false)
    setPhase('selfConcept')
  }

  const currentSelection = phase === 'selfConcept' ? selfConcept : self

  // ── Result view ─────────────────────────────────────────────────────────────
  if (phase === 'result' && result) {
    const layer1 = member?.leadership
    const layer1Style = layer1?.golemansStyles[0]
    const layer1Archetype = layer1?.archetype
    const profileMeta = SUB_PROFILES.find(p => p.id === result.subProfile)
    const group = profileMeta?.group ?? 'stabilizing'
    const theme = pickTheme(layer1Archetype, group)
    const topStyles = pickTopTwoStyles(result.golemanRadar)
    const dominantStyle = topStyles[0]
    const dominantLabel = t(`layer1:golemanStyles.${dominantStyle}`)
    const profileName = t(`layer2:subProfiles.${result.subProfile}.name`)
    const strengths = t(`layer2:subProfiles.${result.subProfile}.strengths`, { returnObjects: true }) as string[]
    const cautions  = t(`layer2:subProfiles.${result.subProfile}.cautions`,  { returnObjects: true }) as string[]
    const idealEnvironment   = t(`layer2:subProfiles.${result.subProfile}.idealEnvironment`)
    const communicationStyle = t(`layer2:subProfiles.${result.subProfile}.communicationStyle`)
    const typicalRoles       = t(`layer2:subProfiles.${result.subProfile}.typicalRoles`, { returnObjects: true }) as string[]
    const styleLabels = Object.fromEntries(
      GOLEMAN_STYLES.map(s => [s, t(`layer1:golemanStyles.${s}`)]),
    ) as Record<GolemansStyle, string>

    return (
      <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-6">
        <div className={`w-full max-w-2xl rounded-2xl border-2 p-6 space-y-5 ${theme.card}`}>
          {/* Header — mirrors ArchetypeCard's eyebrow / h2 / subtitle / description / divider / cross-link rhythm */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest opacity-60">
              {t('layer2:result.eyebrow')}
            </p>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-3xl" aria-hidden>
                {t(`layer2:subProfiles.${result.subProfile}.icon`)}
              </span>
              <h2 className="text-3xl font-bold">{profileName}</h2>
            </div>
            <p className="text-xs font-medium opacity-50 mt-0.5">
              {t(`layer2:result.groupLabels.${group}`)} · {t('layer2:result.subtitle')}
            </p>
            <p className="mt-2 text-sm opacity-80">
              {t(`layer2:subProfiles.${result.subProfile}.description`)}
            </p>
            <div className="mt-3 pt-3 border-t border-current/10">
              {layer1Archetype ? (
                <p className="text-xs opacity-70 leading-relaxed">
                  {t('layer2:result.layer1Callout', {
                    triad: t(`layer1:result.headlineByArchetype.${layer1Archetype}`),
                    profile: profileName,
                  })}
                </p>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs opacity-70 leading-relaxed">{t('layer2:result.layer1Missing')}</p>
                  <Link
                    to="/assessment/leadership"
                    className="shrink-0 text-xs font-semibold whitespace-nowrap hover:underline"
                    style={{ color: theme.accent }}
                  >
                    {t('layer2:result.takeLayer1')}
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Behavioral Drives — pill grid mirroring Layer 1's "Behavior Scores" visual */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              {t('layer2:result.drivesHeading')}
            </p>
            <DrivesPillGrid factors={result.factors} accent={theme.accent} />
            <p className="text-xs opacity-60 pt-2">{t('layer2:result.drivesNote')}</p>
          </div>

          {/* Leader's Strengths — mirrors ArchetypeCard's "Leader's Skills" */}
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

          {/* Areas for Growth — mirrors ArchetypeCard's "Characteristics" rhythm */}
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

          {/* Ideal Environment — situational fit */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              {t('layer2:result.idealEnvironmentHeading')}
            </p>
            <p className="text-sm opacity-90 leading-relaxed">{idealEnvironment}</p>
          </div>

          {/* Communication Style — interpersonal pattern */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              {t('layer2:result.communicationStyleHeading')}
            </p>
            <p className="text-sm opacity-90 leading-relaxed">{communicationStyle}</p>
          </div>

          {/* Typical Roles — career anchors, rendered as chips */}
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

          {/* Style Distribution — unique to Layer 2 (the full 6-axis radar) */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">
              {t('layer2:result.distributionHeading')}
            </p>
            <div className="bg-white/50 rounded-xl p-4 space-y-4">
              <div className="flex flex-col items-center text-center pb-3 border-b border-current/10">
                <p className="text-[11px] font-semibold uppercase tracking-widest opacity-60">
                  {t('layer2:result.dominantHeading')}
                </p>
                <p className="text-2xl font-bold mt-1" style={{ color: theme.accent }}>
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
                radar={result.golemanRadar}
                dominantStyle={dominantStyle}
                labels={styleLabels}
                color={theme.accent}
              />
            </div>
          </div>

          {/* Leadership Styles — Attitudes & Behaviors — identical heading + shape as ArchetypeCard */}
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60">
              {t('layer2:result.deepDiveHeading')}
            </p>
            {topStyles.map(style => {
              const d = BEHAVIOR_DETAILS[style]
              return (
                <div key={style} className="bg-white/50 rounded-xl p-4 space-y-2">
                  <p className="font-bold capitalize text-sm">
                    {d.label} <span className="font-normal opacity-50 text-xs">({t(`layer1:golemanStyles.${style}`)})</span>
                  </p>
                  <table className="w-full text-xs border-separate border-spacing-y-1">
                    <tbody>
                      {DEEP_DIVE_FIELDS.map(field => (
                        <tr key={field}>
                          <td className="font-semibold opacity-60 pr-3 whitespace-nowrap align-top w-32">
                            {t(`layer2:result.deepDive.${field}`)}
                          </td>
                          <td className="opacity-90">{d[field]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <button
            onClick={() => setShowDiff(v => !v)}
            disabled={!layer1}
            className="px-4 py-2 bg-forma-surface border border-forma-border rounded-lg text-sm font-medium hover:border-forma-border-hover disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {showDiff ? t('layer2:result.diff.closeButton') : t('layer2:result.diff.openButton')}
          </button>
          <button
            onClick={handleRetake}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            {t('layer2:form.retake')}
          </button>
          <Link to="/onboarding" className="text-sm text-blue-600 hover:underline self-center">
            {t('layer2:form.home')}
          </Link>
        </div>

        {/* Diff view — side-by-side Layer 1 vs Layer 2 */}
        {showDiff && layer1 && (() => {
          const l1Radar = computeLayer1GolemanRadar(layer1.scores)
          const l1PrimaryGoleman = layer1.golemansStyles[0]!
          const verdict = classifyAlignment(l1PrimaryGoleman, result.golemanRadar)
          const l1StyleLabel = t(`layer1:golemanStyles.${l1PrimaryGoleman}`)
          const l2StyleLabel = dominantLabel
          return (
            <section className="w-full max-w-3xl bg-white border border-gray-200 rounded-2xl p-6 space-y-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {t('layer2:result.diff.heading')}
              </p>

              {/* Two-column header strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border-r-0 md:border-r border-gray-200 pr-0 md:pr-4">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {t('layer2:result.diff.layer1Label')}
                  </p>
                  <p className="text-xs opacity-60 mt-2">{t('layer2:result.diff.layer1Eyebrow')}</p>
                  <p className="font-bold text-base mt-0.5">
                    {t(`layer1:result.triads.${layer1.archetype}`)}
                  </p>
                  <p className="text-xs opacity-60 mt-3">{t('layer2:result.diff.layer1PrimaryGoleman')}</p>
                  <p className="font-semibold text-sm">
                    {l1StyleLabel} <span className="opacity-60 italic font-normal">· {GOLEMAN_STYLE_MOTTOS[l1PrimaryGoleman]}</span>
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
                    {t('layer2:result.diff.layer2Label')}
                  </p>
                  <p className="text-xs opacity-60 mt-2">{t('layer2:result.diff.layer2Eyebrow')}</p>
                  <p className="font-bold text-base mt-0.5">
                    <span aria-hidden>{t(`layer2:subProfiles.${result.subProfile}.icon`)}</span>{' '}
                    {profileName}
                    <span className="opacity-60 font-normal text-xs"> · {t(`layer2:result.groupLabels.${group}`)}</span>
                  </p>
                  <p className="text-xs opacity-60 mt-3">{t('layer2:result.diff.layer2DominantGoleman')}</p>
                  <p className="font-semibold text-sm">
                    {l2StyleLabel} <span className="opacity-60 italic font-normal">· {t(`layer2:result.golemanMottos.${dominantStyle}`)}</span>
                  </p>
                </div>
              </div>

              {/* Overlaid radar */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-2">
                  {t('layer2:result.diff.overlayHeading')}
                </p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <GolemanRadarChart
                    radar={result.golemanRadar}
                    compareRadar={l1Radar}
                    primaryLabel={t('layer2:result.diff.layer2Label')}
                    compareLabel={t('layer2:result.diff.layer1Label')}
                    color={theme.accent}
                    compareColor="#6b7280"
                    labels={styleLabels}
                  />
                </div>
              </div>

              {/* Verdict line */}
              <div
                className={`rounded-xl px-4 py-3 text-sm border ${
                  verdict === 'aligned'    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                  verdict === 'softMismatch' ? 'bg-amber-50  border-amber-200  text-amber-900' :
                                              'bg-red-50    border-red-200    text-red-900'
                }`}
              >
                {verdict === 'aligned'
                  ? t('layer2:result.diff.verdict.aligned', { style: l1StyleLabel })
                  : t(`layer2:result.diff.verdict.${verdict}`, { layer1: l1StyleLabel, layer2: l2StyleLabel })}
              </div>
            </section>
          )
        })()}

        {showDiff && !layer1 && (
          <p className="text-sm text-forma-muted bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            {t('layer2:result.diff.noLayer1')}
          </p>
        )}
      </main>
    )
  }

  // ── Form view (pass 1 or 2) ─────────────────────────────────────────────────
  const isPass1 = phase === 'selfConcept'
  const submitting = phase === 'submitting'

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-6">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-bold">{t('layer2:page.title')}</h1>
        <p className="text-sm text-forma-muted mt-2">{t('layer2:page.subtitle')}</p>
      </div>

      <TimeBudgetChip budgetMinutes={10} />

      <section className="w-full max-w-3xl bg-forma-surface border border-forma-border rounded-2xl p-6 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-forma-accent">
            {t(`layer2:phases.${isPass1 ? 'selfConcept' : 'self'}.title`)}
          </p>
          <p className="text-sm mt-1">
            {t(`layer2:phases.${isPass1 ? 'selfConcept' : 'self'}.instructions`)}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {adjectives.map(adj => {
            const selected = currentSelection.has(adj.id)
            return (
              <button
                key={adj.id}
                type="button"
                onClick={() => toggleAdjective(adj.id)}
                aria-pressed={selected}
                disabled={submitting}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left ${
                  selected
                    ? 'bg-forma-accent text-white border-forma-accent'
                    : 'bg-forma-surface text-forma-text border-forma-border hover:border-forma-border-hover'
                } disabled:opacity-50`}
              >
                {t(`layer2:adjectives.${adj.id}`)}
              </button>
            )
          })}
        </div>

        {(() => {
          const belowMin = currentSelection.size < MIN_SELECTIONS_PER_PASS
          return (
            <>
              <div className="flex items-center justify-between gap-3 pt-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-mono ${belowMin ? 'text-amber-700' : 'text-forma-muted'}`}>
                      {belowMin
                        ? t('layer2:form.selectionProgress', { count: currentSelection.size, min: MIN_SELECTIONS_PER_PASS })
                        : t('layer2:form.selectionCount', { count: currentSelection.size })}
                    </p>
                    {!belowMin && (
                      <span className="text-xs text-emerald-600" aria-hidden>✓</span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1 mt-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[200px]">
                    <div
                      className={`h-full rounded-full transition-all ${belowMin ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(100, (currentSelection.size / MIN_SELECTIONS_PER_PASS) * 100)}%` }}
                    />
                  </div>
                </div>
                {isPass1 ? (
                  <button
                    type="button"
                    onClick={() => setPhase('self')}
                    disabled={submitting || belowMin}
                    className="px-6 py-2.5 bg-forma-accent text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                  >
                    {t('layer2:form.next')}
                  </button>
                ) : (
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      type="button"
                      onClick={() => setPhase('selfConcept')}
                      disabled={submitting}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('layer2:form.back')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting || belowMin}
                      className="px-6 py-2.5 bg-forma-accent text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {submitting ? '…' : t('layer2:form.submit')}
                    </button>
                  </div>
                )}
              </div>
              {belowMin && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  {t('layer2:form.minimumHint', { min: MIN_SELECTIONS_PER_PASS })}
                </p>
              )}
            </>
          )
        })()}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </p>
        )}
      </section>
    </main>
  )
}

// ── Subcomponents ─────────────────────────────────────────────────────────────

// 2-column pill grid for behavioral drives — mirrors ArchetypeCard's "Behavior Scores"
// visual. Click the ⓘ on a pill to expand its description below the whole grid.
function DrivesPillGrid({
  factors,
  accent,
}: {
  factors: BehavioralCoreFactors
  accent: string
}) {
  const { t } = useTranslation(['layer2'])
  const [openFactor, setOpenFactor] = useState<keyof BehavioralCoreFactors | null>(null)
  return (
    <div>
      <div className="grid grid-cols-2 gap-2">
        {FACTOR_KEYS.map(key => {
          const isOpen = openFactor === key
          const value = Math.max(0, Math.min(100, factors[key]))
          return (
            <div
              key={key}
              className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-1.5"
            >
              <span className="flex items-center gap-1.5 text-sm">
                {t(`layer2:result.factors.${key}`)}
                <button
                  type="button"
                  onClick={() => setOpenFactor(prev => prev === key ? null : key)}
                  aria-expanded={isOpen}
                  aria-label={`${t(`layer2:result.factors.${key}`)} — what does this mean?`}
                  className="inline-flex items-center justify-center w-4 h-4 rounded-full border text-[10px] font-bold transition-colors"
                  style={{
                    color: isOpen ? '#fff' : accent,
                    backgroundColor: isOpen ? accent : 'transparent',
                    borderColor: accent,
                  }}
                >
                  i
                </button>
              </span>
              <span className="font-bold text-sm">{Math.round(value)}/100</span>
            </div>
          )
        })}
      </div>
      {openFactor && (
        <p
          className="text-xs opacity-80 mt-2 pl-3 border-l-2 leading-relaxed"
          style={{ borderColor: accent }}
        >
          <span className="font-semibold">{t(`layer2:result.factors.${openFactor}`)}:</span>{' '}
          {t(`layer2:result.factorInfo.${openFactor}`)}
        </p>
      )}
    </div>
  )
}

// Single-dominant projection of the Goleman radar (DESIGN-Q: single-vs-distribution).
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

// Top-2 projection — mirrors Layer 1's ArchetypeCard, which renders deep-dive
// tables for `golemansStyles[0]` and `golemansStyles[1]` (primary + secondary).
function pickTopTwoStyles(radar: GolemanRadar): [GolemansStyle, GolemansStyle] {
  const sorted = [...GOLEMAN_STYLES].sort((a, b) => radar[b] - radar[a])
  return [sorted[0]!, sorted[1]!]
}

// Project Layer 1's per-ORGANIC-behavior scores (2-20 each) onto the same
// 6-axis Goleman radar Layer 2 uses, so we can overlay both. The OA behaviors
// map 1:1 to Goleman styles (BEHAVIOR_TO_GOLEMAN); we just rescale 2-20 → 0-100.
function computeLayer1GolemanRadar(scores: LeadershipScores): GolemanRadar {
  const norm = (s: number) => Math.max(0, Math.min(100, ((s - 2) / 18) * 100))
  return {
    coercive:      norm(scores.directing),
    authoritative: norm(scores.envisioning),
    pacesetting:   norm(scores.demanding),
    democratic:    norm(scores.conducting),
    coaching:      norm(scores.coaching),
    visionary:     norm(scores.catalyzing),
  }
}

// Three-state alignment classifier comparing Layer 1's primary Goleman to
// Layer 2's dominant Goleman from the radar.
function classifyAlignment(l1Dominant: GolemansStyle, l2Radar: GolemanRadar): AlignmentVerdict {
  const l2Dominant = pickDominantStyle(l2Radar)
  if (l1Dominant === l2Dominant) return 'aligned'
  const sortedL2 = [...GOLEMAN_STYLES].sort((a, b) => l2Radar[b] - l2Radar[a])
  const l1RankInL2 = sortedL2.indexOf(l1Dominant)
  return l1RankInL2 <= 2 ? 'softMismatch' : 'stretching'
}
