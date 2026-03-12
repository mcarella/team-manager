import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { computeLeadershipScores, computeArchetype } from '@team-manager/core'
import type { LeadershipAssessment, PeerLeadershipSummary } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import LeadershipForm from '../components/LeadershipForm.js'
import ArchetypeCard from '../components/ArchetypeCard.js'
import { API_BASE } from '../lib/api.js'
import { BEHAVIOR_LABELS, GOLEMAN_MOTTOS, BEHAVIOR_PAIRS, thirdPersonQuestions } from '../lib/leadership-constants.js'
import { ARCHETYPE_COLORS } from '../lib/archetype-colors.js'
import TabSwitcher from '../components/shared/TabSwitcher.js'

type MainTab = 'mine' | 'rate' | 'others'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LeadershipAssessmentPage() {
  const { currentUserId, saveLeadershipAssessment, members, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState<MainTab>('mine')

  // My Leadership state
  const [result, setResult] = useState<LeadershipAssessment | null>(null)
  const [retaking, setRetaking] = useState(false)

  // Feedback to Others state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<number[]>(Array(12).fill(5))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set())

  // How Others See Me state
  const [peerSummary, setPeerSummary] = useState<PeerLeadershipSummary | null>(null)
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

  // Pre-populate evaluated set when entering the feedback tab
  useEffect(() => {
    if (mainTab !== 'rate') return
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
  }, [mainTab])

  // Prefetch previous answers when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    setAnswers(Array(12).fill(5))
    fetch(`${API_BASE}/peer-assessments/leadership/${selectedSubjectId}/my-assessment/${userId}`)
      .then(r => r.json())
      .then((data: { answers: number[] } | null) => {
        if (data?.answers) setAnswers(data.answers)
      })
      .catch(() => {})
  }, [selectedSubjectId, userId])

  // Load "how others see me" when tab opens
  useEffect(() => {
    if (mainTab !== 'others') return
    if (summaryLoaded) return
    setPeerSummary(null)
    fetch(`${API_BASE}/peer-assessments/leadership/${userId}/summary`)
      .then(r => r.json())
      .then((data: PeerLeadershipSummary) => { setPeerSummary(data); setSummaryLoaded(true) })
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

  const selectedSubject = members.find(m => m.user.id === selectedSubjectId)

  const TABS: { key: MainTab; label: string }[] = [
    { key: 'mine',   label: 'My Leadership' },
    { key: 'others', label: 'How Others See Me' },
    { key: 'rate',   label: 'Feedback to Others' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Leadership</h1>
        <p className="text-gray-500 mt-2">Self-assessment and 360° peer feedback.</p>
      </div>

      {/* Tab switcher */}
      <TabSwitcher tabs={TABS} active={mainTab} onChange={setMainTab} />

      {/* ── My Leadership ─────────────────────────────────────────────────────── */}
      {mainTab === 'mine' && (
        <div className="w-full max-w-2xl">
          {displayResult ? (
            <div className="flex flex-col items-center gap-6">
              <ArchetypeCard assessment={displayResult} />
              <div className="flex gap-4">
                <button
                  onClick={() => { setResult(null); setRetaking(true) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Retake assessment
                </button>
                <Link to="/onboarding" className="text-sm text-blue-600 hover:underline">← Back</Link>
              </div>
            </div>
          ) : (
            <LeadershipForm userId={userId} onComplete={handleComplete} />
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
                    {evaluated && <span className={`text-xs font-bold ${selectedSubjectId === m.user.id ? 'text-green-300' : 'text-green-600'}`}>✓</span>}
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
              </>
            )}
          </div>
        </div>
      )}

      {/* ── How Others See Me ─────────────────────────────────────────────────── */}
      {mainTab === 'others' && (
        <div className="w-full max-w-2xl">
          {!peerSummary ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <LeadershipSummaryView summary={peerSummary} selfLeadership={existingAssessment ?? null} />
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
  if (summary.totalEvaluators === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm border border-dashed rounded-xl">
        No peer evaluations yet. Ask your teammates to evaluate you in their Leadership tab.
      </div>
    )
  }

  const selfArchetype = selfLeadership?.archetype ?? null
  const archetypeMismatch = selfArchetype && summary.dominantArchetype && selfArchetype !== summary.dominantArchetype

  return (
    <div className="space-y-5">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{summary.totalEvaluators}</span> peer{summary.totalEvaluators === 1 ? '' : 's'} evaluated. Individual responses are anonymous.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {selfArchetype && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">You see yourself as</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ARCHETYPE_COLORS[selfArchetype] ?? 'bg-gray-100 text-gray-600'}`}>{selfArchetype}</span>
          </div>
        )}
        {summary.dominantArchetype && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">{archetypeMismatch ? '→ peers see you as' : '· peers agree:'}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ARCHETYPE_COLORS[summary.dominantArchetype] ?? 'bg-gray-100 text-gray-600'}`}>{summary.dominantArchetype}</span>
          </div>
        )}
      </div>

      {archetypeMismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Archetype mismatch</span> — You see yourself as a <span className="font-semibold capitalize">{selfArchetype}</span> but your peers perceive you as a <span className="font-semibold capitalize">{summary.dominantArchetype}</span>.
        </div>
      )}

      <div className="space-y-4">
        {BEHAVIOR_PAIRS.map(b => {
          const peerData = summary.behaviors[b]
          const selfScore = selfLeadership?.scores[b] ?? null
          const delta = selfScore !== null ? peerData.average - selfScore : null
          return (
            <div key={b} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-gray-800">{BEHAVIOR_LABELS[b]}</span>
                  <span className="text-xs text-gray-400 ml-2">{GOLEMAN_MOTTOS[b]}</span>
                </div>
                {delta !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    Math.abs(delta) <= 2 ? 'bg-green-100 text-green-700' :
                    delta < 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {Math.abs(delta) <= 2 ? 'Aligned' : delta < 0 ? '⚠ Blind spot' : '✨ Hidden strength'}
                  </span>
                )}
              </div>
              {selfScore !== null && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Me</span>
                  <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(selfScore / 20) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-8 shrink-0">{selfScore}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Peers</span>
                <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 opacity-50 rounded-full" style={{ width: `${(peerData.average / 20) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-8 shrink-0">{peerData.average.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
