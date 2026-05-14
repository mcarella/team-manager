import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { computeLeadershipScores, computeArchetype } from '@team-manager/core'
import type {
  LeadershipAssessment,
  PeerLeadershipSummary,
  PeerBehavioralCoreSummary,
  BehavioralCoreAssessment,
} from '@team-manager/shared'
import { computeAdjectiveCloud, SUB_PROFILES } from '@team-manager/core'
import { useStore } from '../store/index.js'
import LeadershipForm from '../components/LeadershipForm.js'
import LeadershipRecap from '../components/LeadershipRecap.js'
import TimeBudgetChip from '../components/TimeBudgetChip.js'
import AdjectiveSelectionGrid from '../components/AdjectiveSelectionGrid.js'
import AdjectiveTreemap from '../components/AdjectiveTreemap.js'
import KiviatChart from '../components/KiviatChart.js'
import Layer2ArchetypeCard from '../components/Layer2ArchetypeCard.js'
import OAArchetypeCard from '../components/OAArchetypeCard.js'
import { ARCHETYPE_ACCENTS, ARCHETYPE_CARD_COLORS } from '../lib/archetype-colors.js'
import { API_BASE } from '../lib/api.js'
import { BEHAVIOR_LABELS, GOLEMAN_MOTTOS, BEHAVIOR_PAIRS, thirdPersonQuestions } from '../lib/leadership-constants.js'
import TabSwitcher from '../components/shared/TabSwitcher.js'

type MainTab = 'mine' | 'rate' | 'others'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LeadershipAssessmentPage() {
  const { t } = useTranslation(['layer1'])
  const { currentUserId, saveLeadershipAssessment, members, teams, managerTeamIds, assessmentDepth } = useStore()
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState<MainTab>('mine')

  // My Leadership state
  const [result, setResult] = useState<LeadershipAssessment | null>(null)
  const [retaking, setRetaking] = useState(false)

  // Feedback to Others — Layer 1 (12-Q) state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number[]>(Array(12).fill(5))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set())

  // Feedback to Others — Layer 2 (86-adjective peer) state
  const [showDeeperFor, setShowDeeperFor] = useState<string | null>(null)
  const [peerL2Picks, setPeerL2Picks] = useState<Set<string>>(new Set())
  const [peerL2Saving, setPeerL2Saving] = useState(false)
  const [peerL2Saved, setPeerL2Saved] = useState(false)
  const [l2EvaluatedIds, setL2EvaluatedIds] = useState<Set<string>>(new Set())
  const PEER_L2_MIN = 15

  // How Others See Me state
  const [peerSummary, setPeerSummary] = useState<PeerLeadershipSummary | null>(null)
  const [peerL2Summary, setPeerL2Summary] = useState<PeerBehavioralCoreSummary | null>(null)
  const [summaryLoaded, setSummaryLoaded] = useState(false)

  const userId = currentUserId ?? ''
  if (!userId) { navigate('/', { replace: true }); return null }

  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.leadership
  const displayResult = result ?? (!retaking ? existingAssessment ?? null : null)

  const myTeams = teams.filter(t => t.members.some(m => m.user.id === userId))
  const myManagerIds = new Set(
    myTeams.flatMap(t =>
      Object.entries(managerTeamIds)
        .filter(([, tids]) => tids.includes(t.id))
        .map(([mid]) => mid)
    )
  )
  const myManagers = members.filter(m => myManagerIds.has(m.user.id))
  const teammates = members.filter(
    m => m.user.id !== userId && !myManagerIds.has(m.user.id) && m.user.role !== 'manager'
  )

  // Pre-populate L1 + L2 evaluated sets when entering the feedback tab
  useEffect(() => {
    if (mainTab !== 'rate') return
    // Layer 1 evaluated check
    Promise.all(
      teammates.map(m =>
        fetch(`${API_BASE}/peer-assessments/leadership/${m.user.id}/my-assessment/${userId}`)
          .then(r => r.json())
          .then((data: { answers: number[] } | null) => data ? m.user.id : null)
          .catch(() => null)
      )
    ).then(results => {
      const ids = results.filter((id): id is string => id !== null)
      if (ids.length > 0) setEvaluatedIds(prev => new Set([...prev, ...ids]))
    })
    // Layer 2 evaluated check
    Promise.all(
      teammates.map(m =>
        fetch(`${API_BASE}/peer-assessments/behavioral-core/${m.user.id}/my-assessment/${userId}`)
          .then(r => r.json())
          .then((data: { picks: string[] } | null) => data ? m.user.id : null)
          .catch(() => null)
      )
    ).then(results => {
      const ids = results.filter((id): id is string => id !== null)
      if (ids.length > 0) setL2EvaluatedIds(prev => new Set([...prev, ...ids]))
    })
  }, [mainTab])

  // Prefetch previous Layer 1 + Layer 2 answers when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    setAnswers(Array(12).fill(5))
    setPeerL2Picks(new Set())
    setPeerL2Saved(false)
    setShowDeeperFor(null)
    // L1 prefetch
    fetch(`${API_BASE}/peer-assessments/leadership/${selectedSubjectId}/my-assessment/${userId}`)
      .then(r => r.json())
      .then((data: { answers: number[] } | null) => {
        if (data?.answers) setAnswers(data.answers)
      })
      .catch(() => {})
    // L2 prefetch
    fetch(`${API_BASE}/peer-assessments/behavioral-core/${selectedSubjectId}/my-assessment/${userId}`)
      .then(r => r.json())
      .then((data: { picks: string[] } | null) => {
        if (data?.picks) {
          setPeerL2Picks(new Set(data.picks))
          setPeerL2Saved(true)
        }
      })
      .catch(() => {})
  }, [selectedSubjectId, userId])

  // Load "how others see me" when tab opens (both L1 + L2 summaries in parallel)
  useEffect(() => {
    if (mainTab !== 'others') return
    if (summaryLoaded) return
    setPeerSummary(null)
    setPeerL2Summary(null)
    Promise.all([
      fetch(`${API_BASE}/peer-assessments/leadership/${userId}/summary`)
        .then(r => r.json()) as Promise<PeerLeadershipSummary>,
      fetch(`${API_BASE}/peer-assessments/behavioral-core/${userId}/summary`)
        .then(r => r.json()) as Promise<PeerBehavioralCoreSummary>,
    ])
      .then(([l1, l2]) => {
        setPeerSummary(l1)
        setPeerL2Summary(l2)
        setSummaryLoaded(true)
      })
      .catch(() => {})
  }, [mainTab, userId, summaryLoaded])

  const handleComplete = (assessment: LeadershipAssessment) => {
    saveLeadershipAssessment(assessment)
    setResult(assessment)
    setRetaking(false)
  }

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    setSaving(true)
    try {
      await fetch(`${API_BASE}/peer-assessments/leadership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessorId: userId, subjectId: selectedSubjectId, answers }),
      })
      setSaved(true)
      setEvaluatedIds(prev => new Set([...prev, selectedSubjectId]))
    } finally {
      setSaving(false)
    }
  }

  const togglePeerL2Pick = (id: string) => {
    setPeerL2Picks(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handlePeerL2Submit = async () => {
    if (!selectedSubjectId) return
    setPeerL2Saving(true)
    try {
      await fetch(`${API_BASE}/peer-assessments/behavioral-core`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assessorId: userId,
          subjectId: selectedSubjectId,
          picks: [...peerL2Picks],
        }),
      })
      setPeerL2Saved(true)
      setL2EvaluatedIds(prev => new Set([...prev, selectedSubjectId]))
    } finally {
      setPeerL2Saving(false)
    }
  }

  const selectedSubject = members.find(m => m.user.id === selectedSubjectId)

  const TABS: { key: MainTab; label: string }[] = [
    { key: 'mine',   label: t('layer1:tabs.mine') },
    { key: 'others', label: t('layer1:tabs.others') },
    { key: 'rate',   label: t('layer1:tabs.rate') },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">{t('layer1:page.title')}</h1>
        <p className="text-gray-500 mt-2">{t('layer1:page.subtitle')}</p>
      </div>

      {/* Tab switcher */}
      <TabSwitcher tabs={TABS} active={mainTab} onChange={setMainTab} />

      {/* ── My Leadership ─────────────────────────────────────────────────────── */}
      {mainTab === 'mine' && (
        <div className="w-full max-w-3xl">
          {displayResult ? (
            <div className="flex flex-col items-center gap-6">
              <LeadershipRecap
                leadership={displayResult}
                behavioralCore={member?.behavioralCore}
                assessmentDepth={assessmentDepth}
              />
              <div className="flex gap-4">
                <button
                  onClick={() => { setResult(null); setRetaking(true) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  {t('layer1:result.retake')}
                </button>
                <Link to="/onboarding" className="text-sm text-blue-600 hover:underline">{t('layer1:result.back')}</Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <TimeBudgetChip budgetMinutes={3} />
              <LeadershipForm userId={userId} onComplete={handleComplete} />
            </div>
          )}
        </div>
      )}

      {/* ── Feedback to Others ────────────────────────────────────────────────── */}
      {mainTab === 'rate' && (
        <div className="w-full max-w-2xl flex gap-6">
          {/* Sidebar */}
          <div className="w-44 shrink-0 space-y-2">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Teammates</p>
              {teammates.length === 0 && <p className="text-sm text-gray-400">No teammates yet.</p>}
              {teammates.map(m => {
                const evaluated = evaluatedIds.has(m.user.id)
                const evaluatedL2 = l2EvaluatedIds.has(m.user.id)
                const tickColor = selectedSubjectId === m.user.id ? 'text-green-300' : 'text-green-600'
                return (
                  <button
                    key={m.user.id}
                    onClick={() => handleSelectSubject(m.user.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors mb-1 flex items-center justify-between ${
                      selectedSubjectId === m.user.id
                        ? 'bg-gray-800 text-white border-gray-800'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <span>{m.user.name}</span>
                    <span className={`text-xs font-bold ${tickColor}`} title={evaluatedL2 ? t('layer1:peerLayer2.sidebarL1L2Title') : evaluated ? t('layer1:peerLayer2.sidebarL1Title') : ''}>
                      {evaluatedL2 ? '✓✓' : evaluated ? '✓' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Form panel */}
          <div className="flex-1">
            {!selectedSubjectId ? (
              <div className="flex items-center justify-center h-48 text-gray-400 text-sm border border-dashed rounded-xl">
                Select a person to evaluate their leadership
              </div>
            ) : (
              <>
                <div className="mb-4 space-y-1">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Rate {selectedSubject?.user.name}'s leadership
                  </h2>
                  <p className="text-xs text-gray-400">Your evaluation is anonymous — they will only see aggregated results.</p>
                  <p className="text-xs text-indigo-600 font-medium">
                    Rate each statement 1–10 based on how well it describes {selectedSubject?.user.name}.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {thirdPersonQuestions(selectedSubject?.user.name ?? 'This person').map((q, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <label className="text-sm text-gray-700 leading-snug">
                          <span className="font-semibold text-gray-400 mr-2">Q{i + 1}.</span>
                          {q}
                        </label>
                        <span className="shrink-0 w-8 text-center font-bold text-blue-700">{answers[i]}</span>
                      </div>
                      <input
                        type="range" min={1} max={10}
                        value={answers[i]}
                        onChange={e => setAnswers(prev => prev.map((a, idx) => idx === i ? Number(e.target.value) : a))}
                        className="w-full accent-blue-600"
                      />
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1 — Never</span><span>10 — Always</span>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={saving}
                      className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50">
                      {saving ? 'Saving…' : 'Submit evaluation'}
                    </button>
                    {saved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
                  </div>
                </form>

                {/* Deeper read CTA — appears when Layer 1 has been submitted (now or in the past)
                    AND user hasn't yet opened the deeper grid AND org is in 'deeper' mode. */}
                {assessmentDepth === 'deeper' && (saved || evaluatedIds.has(selectedSubjectId)) && showDeeperFor !== selectedSubjectId && !peerL2Saved && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => setShowDeeperFor(selectedSubjectId)}
                      className="text-sm font-semibold text-indigo-700 hover:underline"
                    >
                      {t('layer1:peerLayer2.ctaAfterL1')}
                    </button>
                  </div>
                )}

                {/* Deeper read confirmation badge when already submitted */}
                {peerL2Saved && showDeeperFor !== selectedSubjectId && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-700 font-medium">{t('layer1:peerLayer2.saved')}</p>
                    <button
                      type="button"
                      onClick={() => setShowDeeperFor(selectedSubjectId)}
                      className="mt-2 text-xs text-indigo-700 hover:underline"
                    >
                      {t('layer1:peerLayer2.editDeeper')}
                    </button>
                  </div>
                )}

                {/* Deeper read form — adjective selection grid */}
                {showDeeperFor === selectedSubjectId && (() => {
                  const belowMin = peerL2Picks.size < PEER_L2_MIN
                  return (
                    <div className="mt-6 pt-4 border-t border-gray-200 space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                          {t('layer1:peerLayer2.heading')}
                        </p>
                        <p className="text-sm mt-1">
                          {t('layer1:peerLayer2.instructions', { name: selectedSubject?.user.name ?? 'this person' })}
                        </p>
                      </div>

                      <AdjectiveSelectionGrid
                        selected={peerL2Picks}
                        onToggle={togglePeerL2Pick}
                        disabled={peerL2Saving}
                      />

                      <div className="flex items-center justify-between gap-3 pt-2">
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-mono ${belowMin ? 'text-amber-700' : 'text-gray-500'}`}>
                            {belowMin
                              ? t('layer1:peerLayer2.selectionProgress', { count: peerL2Picks.size, min: PEER_L2_MIN })
                              : t('layer1:peerLayer2.selectionCount', { count: peerL2Picks.size })}
                          </p>
                          <div className="h-1 mt-1.5 rounded-full bg-gray-100 overflow-hidden max-w-[200px]">
                            <div
                              className={`h-full rounded-full transition-all ${belowMin ? 'bg-amber-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(100, (peerL2Picks.size / PEER_L2_MIN) * 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => setShowDeeperFor(null)}
                            disabled={peerL2Saving}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
                          >
                            {t('layer1:peerLayer2.cancel')}
                          </button>
                          <button
                            type="button"
                            onClick={handlePeerL2Submit}
                            disabled={peerL2Saving || belowMin}
                            className="px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {peerL2Saving ? t('layer1:peerLayer2.saving') : t('layer1:peerLayer2.submit')}
                          </button>
                        </div>
                      </div>
                      {belowMin && (
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                          {t('layer1:peerLayer2.minimumHint', { min: PEER_L2_MIN })}
                        </p>
                      )}
                    </div>
                  )
                })()}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── How Others See Me ─────────────────────────────────────────────────── */}
      {mainTab === 'others' && (
        <div className="w-full max-w-3xl space-y-6">
          {!peerSummary ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <>
              <LeadershipSummaryView summary={peerSummary} selfLeadership={existingAssessment ?? null} />
              {assessmentDepth === 'deeper' && peerL2Summary && (
                <PeerBehavioralCoreView
                  summary={peerL2Summary}
                  selfArchetype={existingAssessment?.archetype ?? null}
                  selfBehavioralCore={member?.behavioralCore ?? null}
                />
              )}
            </>
          )}
        </div>
      )}
    </main>
  )
}

// ── Sub-component ─────────────────────────────────────────────────────────────

function LeadershipSummaryView({
  summary,
  selfLeadership,
}: {
  summary: PeerLeadershipSummary
  selfLeadership: LeadershipAssessment | null
}) {
  const { t } = useTranslation(['layer1'])
  if (summary.totalEvaluators === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm border border-dashed rounded-xl">
        No peer evaluations yet. Ask your teammates to evaluate you in their Leadership tab.
      </div>
    )
  }

  const selfArchetype = selfLeadership?.archetype ?? null
  const peerArchetype = summary.dominantArchetype ?? null
  const archetypeMismatch = selfArchetype && peerArchetype && selfArchetype !== peerArchetype

  // Build aligned axis arrays for the overlapping radar (one per ORGANIC behavior).
  // When self is missing, peers become the primary series; when self exists, peers overlay it.
  const peerValues = BEHAVIOR_PAIRS.map(b => summary.behaviors[b].average)
  const radarAxes = BEHAVIOR_PAIRS.map((b, i) => ({
    label: BEHAVIOR_LABELS[b]!,
    value: selfLeadership ? selfLeadership.scores[b] : peerValues[i]!,
    secondaryLabel: GOLEMAN_MOTTOS[b]!,
  }))

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{summary.totalEvaluators}</span> peer{summary.totalEvaluators === 1 ? '' : 's'} evaluated. Individual responses are anonymous.
      </p>

      {/* Side-by-side archetype cards */}
      {(selfArchetype || peerArchetype) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selfArchetype ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">How you see yourself</p>
              <OAArchetypeCard archetype={selfArchetype} size="compact" defaultOpen={false} isCurrent />
            </div>
          ) : (
            <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-5 text-sm text-gray-500">
              Take your Layer 1 self-assessment to see your archetype here.
            </div>
          )}
          {peerArchetype && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">How peers see you</p>
              <OAArchetypeCard archetype={peerArchetype} size="compact" defaultOpen={false} isCurrent={!!archetypeMismatch} />
            </div>
          )}
        </div>
      )}

      {archetypeMismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Archetype mismatch</span> — You see yourself as <span className="font-semibold">{t(`layer1:result.triads.${selfArchetype}`)}</span> but your peers perceive you as <span className="font-semibold">{t(`layer1:result.triads.${peerArchetype}`)}</span>.
        </div>
      )}

      {/* Overlapping behaviors radar */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Behaviors — self vs peer</p>
        <div className="flex justify-center">
          <KiviatChart
            axes={radarAxes}
            fullMark={20}
            color={selfLeadership ? '#2563eb' : '#64748b'}
            seriesName={selfLeadership ? 'You' : 'Peers'}
            {...(selfLeadership ? { overlay: { name: 'Peers', values: peerValues, color: '#64748b' } } : {})}
          />
        </div>

        {/* Per-behavior verdict chips */}
        {selfLeadership && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
            {BEHAVIOR_PAIRS.map(b => {
              const peerAvg = summary.behaviors[b].average
              const selfScore = selfLeadership.scores[b]
              const delta = peerAvg - selfScore
              const verdict = Math.abs(delta) <= 2 ? 'aligned' : delta < 0 ? 'blindSpot' : 'hidden'
              const cls =
                verdict === 'aligned' ? 'bg-green-50 border-green-200 text-green-800' :
                verdict === 'blindSpot' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                'bg-blue-50 border-blue-200 text-blue-800'
              const label =
                verdict === 'aligned' ? 'Aligned' :
                verdict === 'blindSpot' ? '⚠ Blind spot' :
                '✨ Hidden strength'
              return (
                <div key={b} className={`text-xs px-2.5 py-1.5 rounded-lg border ${cls} flex items-center justify-between gap-2`}>
                  <span className="font-semibold truncate">{BEHAVIOR_LABELS[b]}</span>
                  <span className="opacity-70 shrink-0">{label}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Peer Behavioral Core view (Layer 2 × How Others See Me) ─────────────────

function PeerBehavioralCoreView({
  summary,
  selfArchetype,
  selfBehavioralCore,
}: {
  summary: PeerBehavioralCoreSummary
  selfArchetype: LeadershipAssessment['archetype'] | null
  selfBehavioralCore: BehavioralCoreAssessment | null
}) {
  const { t } = useTranslation(['layer1', 'layer2'])
  const accent = selfArchetype ? ARCHETYPE_ACCENTS[selfArchetype] ?? '#6b7280' : '#6b7280'
  const cardClass = selfArchetype ? ARCHETYPE_CARD_COLORS[selfArchetype] ?? '' : 'bg-gray-50 border-gray-200'
  const cloud = computeAdjectiveCloud(summary, 30)
  const notEnoughData = summary.totalEvaluators < 2

  return (
    <section className="space-y-5">
      {/* Heatmap — always rendered so the heading is visible even with no data */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-3" style={{ color: accent }}>
          {t('layer1:peerLayer2Summary.heatmapHeading')}
        </p>
        {notEnoughData ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-sm text-gray-500">
            <p className="font-semibold text-gray-700 mb-1">{t('layer1:peerLayer2Summary.notEnoughTitle')}</p>
            <p>{t('layer1:peerLayer2Summary.notEnoughBody', { count: summary.totalEvaluators })}</p>
          </div>
        ) : (
          <>
            <div className="p-1">
              <AdjectiveTreemap data={cloud} totalEvaluators={summary.totalEvaluators} height={320} />
            </div>
            {/* Color legend */}
            <div className="flex flex-wrap gap-3 mt-3 text-[11px] opacity-80">
              <LegendDot color="#ef4444" label="Dominance" />
              <LegendDot color="#f59e0b" label="Extraversion" />
              <LegendDot color="#10b981" label="Patience" />
              <LegendDot color="#6366f1" label="Formality" />
            </div>
          </>
        )}
      </div>

      {/* Peer-perceived drives with self overlay */}
      {summary.subProfile && (
        <div className="rounded-2xl border-2 border-gray-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70 mb-3" style={{ color: accent }}>
            {t('layer1:peerLayer2Summary.drivesHeading')}
          </p>
          <div className="p-1">
            <KiviatChart
              axes={[
                { label: t('layer2:result.factors.dominance'),    value: selfBehavioralCore?.factors.dominance    ?? summary.factors.dominance },
                { label: t('layer2:result.factors.extraversion'), value: selfBehavioralCore?.factors.extraversion ?? summary.factors.extraversion },
                { label: t('layer2:result.factors.patience'),     value: selfBehavioralCore?.factors.patience     ?? summary.factors.patience },
                { label: t('layer2:result.factors.formality'),    value: selfBehavioralCore?.factors.formality    ?? summary.factors.formality },
              ]}
              fullMark={100}
              color={selfBehavioralCore ? accent : '#64748b'}
              seriesName={selfBehavioralCore ? 'You' : 'Peers'}
              {...(selfBehavioralCore
                ? { overlay: {
                    name: 'Peers',
                    values: [
                      summary.factors.dominance,
                      summary.factors.extraversion,
                      summary.factors.patience,
                      summary.factors.formality,
                    ],
                    color: '#64748b',
                  } }
                : {})}
            />
          </div>

          {/* Delta verdict (only when both self and peer present) */}
          {selfBehavioralCore && (
            <DeltaVerdictBadge self={selfBehavioralCore} peer={summary} />
          )}
        </div>
      )}

      {/* Side-by-side behavioral cards */}
      {summary.subProfile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selfBehavioralCore ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">How you see yourself</p>
              <Layer2ArchetypeCard
                profileId={selfBehavioralCore.subProfile}
                size="compact"
                isCurrent
              />
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-xs text-gray-600 flex flex-col justify-center">
              <p className="font-semibold mb-1">{t('layer1:peerLayer2Summary.selfHintLabel')}</p>
              <p>{t('layer1:peerLayer2Summary.selfHint')}</p>
              <Link to="/assessment/layer-2" className="mt-2 font-semibold text-indigo-700 hover:underline">
                {t('layer1:peerLayer2Summary.selfHintCTA')}
              </Link>
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">How peers see you</p>
            <Layer2ArchetypeCard
              profileId={summary.subProfile}
              size="compact"
              isCurrent={!!selfBehavioralCore && selfBehavioralCore.subProfile !== summary.subProfile}
              themeOverride={{ card: cardClass, accent }}
            />
          </div>
        </div>
      )}
    </section>
  )
}

function DeltaVerdictBadge({ self, peer }: { self: BehavioralCoreAssessment; peer: PeerBehavioralCoreSummary }) {
  const { t } = useTranslation(['layer1'])
  const deltas = [
    Math.abs(self.factors.dominance    - peer.factors.dominance),
    Math.abs(self.factors.extraversion - peer.factors.extraversion),
    Math.abs(self.factors.patience     - peer.factors.patience),
    Math.abs(self.factors.formality    - peer.factors.formality),
  ]
  const max = Math.max(...deltas)
  const avg = deltas.reduce((a, b) => a + b, 0) / 4
  const verdict: 'aligned' | 'partial' | 'blindSpot' =
    avg < 10 && max < 15 ? 'aligned' :
    max < 20 ? 'partial' :
    'blindSpot'
  const text = {
    aligned:   t('layer1:peerLayer2Summary.verdictAligned'),
    partial:   t('layer1:peerLayer2Summary.verdictPartial'),
    blindSpot: t('layer1:peerLayer2Summary.verdictBlindSpot', { delta: Math.round(max) }),
  }[verdict]
  const cls = {
    aligned:   'bg-emerald-50 border-emerald-200 text-emerald-900',
    partial:   'bg-amber-50 border-amber-200 text-amber-900',
    blindSpot: 'bg-red-50 border-red-200 text-red-900',
  }[verdict]
  return (
    <div className={`mt-3 text-xs px-3 py-2 rounded-lg border ${cls}`}>
      {text}
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: color }} />
      <span>{label}</span>
    </span>
  )
}

