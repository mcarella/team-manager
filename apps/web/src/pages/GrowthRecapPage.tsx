import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  getArchetypeProgression,
  computeBehaviorDeltas,
  pickTopSkillsToImprove,
  ALL_SABOTEUR_IDS,
  getSaboteurProfile,
  type Behavior,
  type BehaviorDelta,
} from '@team-manager/core'
import type {
  Archetype,
  PeerLeadershipSummary,
  SaboteurAssessment,
} from '@team-manager/shared'
import { useStore } from '../store/index.js'
import { API_BASE } from '../lib/api.js'
import { ARCHETYPE_ACCENTS } from '../lib/archetype-colors.js'
import OAArchetypeCard from '../components/OAArchetypeCard.js'
import Layer2ArchetypeCard from '../components/Layer2ArchetypeCard.js'
import SaboteurCard from '../components/SaboteurCard.js'
import SagePowerCard from '../components/SagePowerCard.js'

// Map ALL_SABOTEUR_IDS to translatable display names — locale key namespace lives in layer3.
// (We only need the type guard here; the actual name lookup uses t('layer3:saboteurs.<id>.name').)

export default function GrowthRecapPage() {
  const { t } = useTranslation(['growth', 'layer3'])
  const navigate = useNavigate()
  const { currentUserId, members, skills } = useStore()

  if (!currentUserId) {
    navigate('/', { replace: true })
    return null
  }

  const me = members.find(m => m.user.id === currentUserId)
  const leadership = me?.leadership
  const behavioralCore = me?.behavioralCore
  const mySkillAssessments = me?.skills ?? []

  // ── Fetch peer leadership + saboteur ─────────────────────────────────────
  const [peerLeadership, setPeerLeadership] = useState<PeerLeadershipSummary | null>(null)
  const [saboteur, setSaboteur] = useState<SaboteurAssessment | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/peer-assessments/leadership/${currentUserId}/summary`)
        .then(r => r.json())
        .catch(() => null),
      fetch(`${API_BASE}/assessments/saboteur/${currentUserId}`)
        .then(r => r.json())
        .catch(() => null),
    ]).then(([pl, sab]) => {
      setPeerLeadership(pl ?? null)
      setSaboteur(sab ?? null)
      setLoaded(true)
    })
  }, [currentUserId])

  // ── Derived ──────────────────────────────────────────────────────────────
  const progression = leadership ? getArchetypeProgression(leadership.archetype) : null
  const deltas: BehaviorDelta[] = useMemo(() => {
    if (!leadership || !peerLeadership) return []
    return computeBehaviorDeltas(leadership.scores, peerLeadership)
  }, [leadership, peerLeadership])

  const hidden = deltas.filter(d => d.classification === 'hidden')
  const blind  = deltas.filter(d => d.classification === 'blind')

  const topSkillsToImprove = useMemo(
    () => pickTopSkillsToImprove(mySkillAssessments, 3),
    [mySkillAssessments],
  )

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-5">

        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{t('growth:page.title')}</h1>
          <p className="text-sm text-gray-500">{t('growth:page.subtitle')}</p>
        </div>

        {/* ── 1. Where you stand ───────────────────────────────────────── */}
        <Section heading={t('growth:whereYouStand.heading')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leadership ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {t('growth:whereYouStand.selfLabel')}
                </p>
                <OAArchetypeCard archetype={leadership.archetype} size="compact" isCurrent />
              </div>
            ) : (
              <EmptyState
                body={t('growth:whereYouStand.leadershipMissing')}
                ctaLabel={t('growth:whereYouStand.leadershipMissingCTA')}
                to="/assessment/leadership"
              />
            )}

            {behavioralCore ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                  {t('growth:whereYouStand.subProfileLabel')}
                </p>
                <Layer2ArchetypeCard profileId={behavioralCore.subProfile} size="compact" isCurrent />
              </div>
            ) : (
              <EmptyState
                body={t('growth:whereYouStand.behavioralMissing')}
                ctaLabel={t('growth:whereYouStand.behavioralMissingCTA')}
                to="/assessment/layer-2"
              />
            )}
          </div>
        </Section>

        {/* ── 2. Path forward ──────────────────────────────────────────── */}
        <Section heading={t('growth:pathForward.heading')} hint={t('growth:pathForward.hint')}>
          {!leadership ? (
            <EmptyState body={t('growth:pathForward.missing')} ctaLabel={t('growth:whereYouStand.leadershipMissingCTA')} to="/assessment/leadership" />
          ) : progression === null ? (
            <PeakCard heading={t('growth:pathForward.peakHeading')} body={t('growth:pathForward.peakBody')} />
          ) : (
            <PathForwardCard
              current={leadership.archetype}
              next={progression.next}
              dampen={progression.dampen}
              amplify={progression.amplify}
            />
          )}
        </Section>

        {/* ── 3. Saboteur antidotes ────────────────────────────────────── */}
        <Section heading={t('growth:saboteurAntidotes.heading')} hint={t('growth:saboteurAntidotes.hint')}>
          {!loaded ? (
            <p className="text-sm text-gray-400 px-1">Loading…</p>
          ) : saboteur ? (
            <div className="space-y-3">
              {saboteur.topSaboteurs
                .filter(id => ALL_SABOTEUR_IDS.includes(id))
                .map((id, i) => {
                  const antidote = getSaboteurProfile(id).sageAntidotes[0]
                  return (
                    <div key={id} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                      <SaboteurCard
                        saboteurId={id}
                        score={saboteur.saboteurScores[id]}
                        size="compact"
                        expandable
                        isCurrent={i === 0}
                      />
                      {antidote && (
                        <SagePowerCard
                          sagePowerId={antidote}
                          caption={t('growth:saboteurAntidotes.antidoteCaption', {
                            saboteur: t(`layer3:saboteurs.${id}.name`),
                          })}
                        />
                      )}
                    </div>
                  )
                })}
            </div>
          ) : (
            <EmptyState
              body={t('growth:saboteurAntidotes.missing')}
              ctaLabel={t('growth:saboteurAntidotes.missingCTA')}
              to="/attitude"
            />
          )}
        </Section>

        {/* ── 4. Hidden strengths & blind spots ────────────────────────── */}
        <Section heading={t('growth:hiddenBlind.heading')} hint={t('growth:hiddenBlind.hint')}>
          {!loaded ? (
            <p className="text-sm text-gray-400 px-1">Loading…</p>
          ) : !leadership || !peerLeadership || peerLeadership.totalEvaluators === 0 ? (
            <EmptyState body={t('growth:hiddenBlind.missing')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DeltaColumn
                heading={t('growth:hiddenBlind.hiddenColumnHeading')}
                hint={t('growth:hiddenBlind.hiddenColumnHint')}
                deltas={hidden}
                emptyBody={t('growth:hiddenBlind.noneHidden')}
                tone="hidden"
              />
              <DeltaColumn
                heading={t('growth:hiddenBlind.blindColumnHeading')}
                hint={t('growth:hiddenBlind.blindColumnHint')}
                deltas={blind}
                emptyBody={t('growth:hiddenBlind.noneBlind')}
                tone="blind"
              />
            </div>
          )}
        </Section>

        {/* ── 5. Top 3 skills to improve ───────────────────────────────── */}
        <Section heading={t('growth:skillsToImprove.heading')} hint={t('growth:skillsToImprove.hint')}>
          {mySkillAssessments.length === 0 ? (
            <EmptyState body={t('growth:skillsToImprove.missing')} ctaLabel={t('growth:skillsToImprove.missingCTA')} to="/assessment/skills" />
          ) : topSkillsToImprove.length === 0 ? (
            <EmptyState body={t('growth:skillsToImprove.atCapBody')} />
          ) : (
            <ol className="space-y-2">
              {topSkillsToImprove.map(s => {
                const name = skills.find(k => k.id === s.skillId)?.name ?? s.skillId
                return (
                  <li key={s.skillId} className="rounded-2xl border-2 border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{name}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-mono">{t('growth:skillsToImprove.currentLevelLabel')}: {s.level}</span>
                        <span className="mx-1.5 text-gray-300">·</span>
                        {t(`growth:skillLevels.${s.level}` as const)}
                      </p>
                    </div>
                    <SkillLevelChip current={s.level} />
                  </li>
                )
              })}
            </ol>
          )}
        </Section>
      </div>
    </main>
  )
}

// ── Section wrapper ─────────────────────────────────────────────────────────
function Section({ heading, hint, children }: { heading: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <div className="px-1 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{heading}</p>
        {hint && <p className="text-xs text-gray-400 leading-relaxed">{hint}</p>}
      </div>
      {children}
    </section>
  )
}

function EmptyState({ body, ctaLabel, to }: { body: string; ctaLabel?: string; to?: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-600 space-y-2">
      <p>{body}</p>
      {ctaLabel && to && (
        <Link to={to} className="inline-block text-xs font-semibold text-indigo-700 hover:underline">
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}

function PeakCard({ heading, body }: { heading: string; body: string }) {
  return (
    <div className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">{heading}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  )
}

// ── Path-forward visual ─────────────────────────────────────────────────────
function PathForwardCard({
  current,
  next,
  dampen,
  amplify,
}: {
  current: Archetype
  next: Archetype
  dampen: Behavior
  amplify: Behavior
}) {
  const { t } = useTranslation(['growth', 'layer1'])
  const currentAccent = ARCHETYPE_ACCENTS[current] ?? '#6b7280'
  const nextAccent    = ARCHETYPE_ACCENTS[next]    ?? '#6b7280'

  return (
    <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-4">
      {/* Current → Next badges */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <ArchetypeBadge archetype={current} color={currentAccent} label={t('growth:pathForward.currentLabel')} prominent />
        <span aria-hidden className="text-gray-300 text-2xl">→</span>
        <ArchetypeBadge archetype={next} color={nextAccent} label={t('growth:pathForward.nextLabel')} />
      </div>

      {/* Dampen / Amplify chips */}
      <div className="grid grid-cols-2 gap-3">
        <BehaviorChip
          label={t('growth:pathForward.dampenLabel')}
          behavior={dampen}
          icon="↓"
          tone="dampen"
        />
        <BehaviorChip
          label={t('growth:pathForward.amplifyLabel')}
          behavior={amplify}
          icon="↑"
          tone="amplify"
        />
      </div>

      {/* Guidance copy */}
      <p className="text-sm text-gray-700 leading-relaxed text-center">
        {t('growth:pathForward.guidance', {
          next: t(`layer1:result.triads.${next}`),
          dampen: t(`growth:behaviors.${dampen}`).toLowerCase(),
          amplify: t(`growth:behaviors.${amplify}`).toLowerCase(),
        })}
      </p>
    </article>
  )
}

function ArchetypeBadge({
  archetype,
  color,
  label,
  prominent = false,
}: {
  archetype: Archetype
  color: string
  label: string
  prominent?: boolean
}) {
  const { t } = useTranslation(['layer1'])
  return (
    <div className="text-center space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
      <p
        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${prominent ? '' : 'opacity-70'}`}
        style={{ backgroundColor: `${color}15`, color }}
      >
        {t(`layer1:result.triads.${archetype}`)}
      </p>
    </div>
  )
}

function BehaviorChip({
  label,
  behavior,
  icon,
  tone,
}: {
  label: string
  behavior: Behavior
  icon: string
  tone: 'dampen' | 'amplify'
}) {
  const { t } = useTranslation(['growth'])
  const cls = tone === 'dampen'
    ? 'bg-rose-50 border-rose-200 text-rose-900'
    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
  return (
    <div className={`rounded-xl border-2 px-3 py-3 ${cls} text-center`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest opacity-70">{label}</p>
      <p className="text-base font-bold mt-0.5">
        <span aria-hidden className="mr-1">{icon}</span>
        {t(`growth:behaviors.${behavior}`)}
      </p>
    </div>
  )
}

// ── Hidden / blind delta column ─────────────────────────────────────────────
function DeltaColumn({
  heading,
  hint,
  deltas,
  emptyBody,
  tone,
}: {
  heading: string
  hint: string
  deltas: BehaviorDelta[]
  emptyBody: string
  tone: 'hidden' | 'blind'
}) {
  const { t } = useTranslation(['growth'])
  const accent = tone === 'hidden' ? 'text-emerald-700' : 'text-rose-700'
  const bg     = tone === 'hidden' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
  return (
    <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-3">
      <div className="space-y-0.5">
        <p className={`text-xs font-semibold uppercase tracking-widest ${accent}`}>{heading}</p>
        <p className="text-[11px] text-gray-400 leading-relaxed">{hint}</p>
      </div>
      {deltas.length === 0 ? (
        <p className="text-xs text-gray-500 italic">{emptyBody}</p>
      ) : (
        <ul className="space-y-2">
          {deltas
            .slice()
            .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
            .map(d => (
              <li key={d.behavior} className={`rounded-lg border ${bg} px-3 py-2`}>
                <p className="text-sm font-semibold">{t(`growth:behaviors.${d.behavior}`)}</p>
                <p className="text-[11px] opacity-70 font-mono">
                  {t('growth:hiddenBlind.deltaLabel', { self: d.self.toFixed(0), peer: d.peer.toFixed(1) })}
                </p>
              </li>
            ))}
        </ul>
      )}
    </article>
  )
}

// ── Skill level chip ────────────────────────────────────────────────────────
function SkillLevelChip({ current }: { current: number }) {
  const next = Math.min(4, current + 1)
  const colors: Record<number, string> = {
    0: 'bg-gray-100 text-gray-600',
    1: 'bg-blue-50 text-blue-700',
    2: 'bg-indigo-50 text-indigo-700',
    3: 'bg-purple-50 text-purple-700',
    4: 'bg-emerald-50 text-emerald-700',
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${colors[current] ?? colors[0]}`}>
        {current}
      </span>
      <span className="text-gray-300" aria-hidden>→</span>
      <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ring-2 ring-indigo-200 ${colors[next] ?? colors[0]}`}>
        {next}
      </span>
    </div>
  )
}
