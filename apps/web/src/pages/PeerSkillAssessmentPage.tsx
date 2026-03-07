import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeLeadershipScores, computeArchetype } from '@team-manager/core'
import { useStore } from '../store/index.js'
import type { PeerLeadershipSummary, LeadershipAssessment } from '@team-manager/shared'

const API = 'http://localhost:3001'

// ── Skills constants ──────────────────────────────────────────────────────────

const LEVEL_LABELS: Record<number, string> = {
  0: "Don't know", 1: 'Know theory', 2: 'Autonomous', 3: 'Master', 4: 'Can teach',
}
const LEVEL_COLORS: Record<number, string> = {
  0: 'bg-gray-100 text-gray-500 border-gray-200',
  1: 'bg-blue-50 text-blue-600 border-blue-200',
  2: 'bg-green-50 text-green-700 border-green-200',
  3: 'bg-purple-50 text-purple-700 border-purple-200',
  4: 'bg-amber-50 text-amber-700 border-amber-200',
}
const LEVEL_ACTIVE: Record<number, string> = {
  0: 'bg-gray-400 text-white border-gray-400',
  1: 'bg-blue-500 text-white border-blue-500',
  2: 'bg-green-600 text-white border-green-600',
  3: 'bg-purple-600 text-white border-purple-600',
  4: 'bg-amber-500 text-white border-amber-500',
}
const LEVEL_BAR: Record<number, string> = {
  0: 'bg-gray-400', 1: 'bg-blue-500', 2: 'bg-green-600', 3: 'bg-purple-600', 4: 'bg-amber-500',
}

// ── Leadership constants ──────────────────────────────────────────────────────

const BEHAVIOR_LABELS: Record<string, string> = {
  catalyzing: 'Catalyzing', envisioning: 'Envisioning', demanding: 'Demanding',
  coaching: 'Coaching', conducting: 'Conducting', directing: 'Directing',
}
const GOLEMAN_MOTTOS: Record<string, string> = {
  catalyzing: '"See the whole picture"', envisioning: '"Come with me"',
  demanding: '"Do as I do, now"', coaching: '"Try this"',
  conducting: '"What do you think?"', directing: '"Do what I tell you"',
}
const BEHAVIOR_PAIRS = ['catalyzing', 'envisioning', 'demanding', 'coaching', 'conducting', 'directing'] as const

const ARCHETYPE_COLORS: Record<string, string> = {
  expert: 'bg-red-100 text-red-700', coordinator: 'bg-orange-100 text-orange-700',
  peer: 'bg-blue-100 text-blue-700', coach: 'bg-green-100 text-green-700',
  strategist: 'bg-purple-100 text-purple-700',
}

function thirdPersonQuestions(name: string): string[] {
  return [
    `${name} is good at encouraging teams to challenge their assumptions and break through to new levels of performance`,
    `${name} is good at getting people on board, motivating them towards compelling strategic goals`,
    `${name} believes in modeling desired behaviors and expecting others to follow their lead`,
    `${name} believes that their solution is never going to be as effective as one their people come up with by themselves`,
    `${name} encourages people to work together while making sure they are meeting their targets`,
    `${name} ensures high quality by being very clear about what they expect of people`,
    `${name} makes sure that individuals can get access to the people and resources they need to do their jobs`,
    `${name} makes sure the right work is always allocated to the right people`,
    `${name} shares goals to reach for, rather than tasks to complete`,
    `${name} prioritizes long-term individual and team growth over short-term results`,
    `${name} takes a back seat from active team leadership and instead supports the team to govern themselves`,
    `${name} delegates tasks but reserves the right to resume control if people are not performing adequately`,
  ]
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

type AssessmentTab = 'skills' | 'leadership'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PeerSkillAssessmentPage() {
  const { currentUserId, members, roles, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  // Shared
  const [tab, setTab] = useState<AssessmentTab>('skills')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)

  // Skills state
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [skillsSaving, setSkillsSaving] = useState(false)
  const [skillsSaved, setSkillsSaved] = useState(false)
  const [skillsSummary, setSkillsSummary] = useState<SkillSummary | null>(null)
  const [skillsView, setSkillsView] = useState<'evaluate' | 'summary'>('evaluate')

  // Leadership state
  const [leadershipAnswers, setLeadershipAnswers] = useState<number[]>(Array(12).fill(5))
  const [leadershipSaving, setLeadershipSaving] = useState(false)
  const [leadershipSaved, setLeadershipSaved] = useState(false)
  const [leadershipSummary, setLeadershipSummary] = useState<PeerLeadershipSummary | null>(null)
  const [leadershipView, setLeadershipView] = useState<'evaluate' | 'summary'>('evaluate')

  const userId = currentUserId ?? ''
  if (!userId) { navigate('/', { replace: true }); return null }

  const myTeams = teams.filter(t => t.members.some(m => m.user.id === userId))
  const myManagerIds = new Set(
    myTeams.flatMap(t =>
      Object.entries(managerTeamIds)
        .filter(([, tids]) => tids.includes(t.id))
        .map(([mid]) => mid)
    )
  )
  const myManagers = members.filter(m => myManagerIds.has(m.user.id))
  const teammates = members.filter(m => m.user.id !== userId && !myManagerIds.has(m.user.id) && m.user.role !== 'manager')

  const allSkills = roles.flatMap(r => r.skills).filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)
  const mySelfAssessment = members.find(m => m.user.id === userId)?.skills ?? []
  const myLeadershipSelf = members.find(m => m.user.id === userId)?.leadership ?? null

  // Prefetch previous leadership answers when subject changes
  useEffect(() => {
    if (!selectedSubjectId) return
    setLeadershipAnswers(Array(12).fill(5))
    fetch(`${API}/peer-assessments/leadership/${selectedSubjectId}/my-assessment/${userId}`)
      .then(r => r.json())
      .then((data: { answers: number[] } | null) => {
        if (data?.answers) setLeadershipAnswers(data.answers)
      })
      .catch(() => {})
  }, [selectedSubjectId, userId])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSelectMyProfile = async () => {
    setSelectedSubjectId(null)

    if (tab === 'skills') {
      setSkillsView('summary')
      setSkillsSummary(null)
      const res = await fetch(`${API}/peer-assessments/skills/${userId}/summary`)
      setSkillsSummary(await res.json())
    } else {
      setLeadershipView('summary')
      setLeadershipSummary(null)
      const res = await fetch(`${API}/peer-assessments/leadership/${userId}/summary`)
      setLeadershipSummary(await res.json())
    }
  }

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setSkillsSaved(false)
    setLeadershipSaved(false)
    setSkillsSummary(null)
    setSkillsView('evaluate')
    setLeadershipView('evaluate')
    const prefill: Record<string, number> = {}
    for (const s of allSkills) prefill[s.id] = 0
    setLevels(prefill)
  }

  const handleSkillsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    setSkillsSaving(true)
    try {
      await Promise.all(
        allSkills.map(skill =>
          fetch(`${API}/peer-assessments/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assessorId: userId, subjectId: selectedSubjectId, skillId: skill.id, level: levels[skill.id] ?? 0 }),
          })
        )
      )
      setSkillsSaved(true)
    } finally {
      setSkillsSaving(false)
    }
  }

  const handleLeadershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    setLeadershipSaving(true)
    try {
      await fetch(`${API}/peer-assessments/leadership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessorId: userId, subjectId: selectedSubjectId, answers: leadershipAnswers }),
      })
      setLeadershipSaved(true)
    } finally {
      setLeadershipSaving(false)
    }
  }

  const selectedSubject = members.find(m => m.user.id === selectedSubjectId)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">360° Peer Assessment</h1>
        <p className="text-gray-500 mt-2">
          Your evaluation is <span className="font-medium text-gray-700">anonymous</span> — teammates only see aggregated results.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="w-full max-w-2xl flex gap-1 bg-gray-100 p-1 rounded-xl">
        {(['skills', 'leadership'] as AssessmentTab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
              tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'skills' ? 'Skills' : 'Leadership'}
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0 space-y-2">
          <button
            onClick={handleSelectMyProfile}
            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              selectedSubjectId === null && (tab === 'skills' ? skillsView : leadershipView) === 'summary'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400'
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">My profile</span>
            How others rate me
          </button>

          {myManagers.length > 0 && (
            <div className="pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Rate my manager</p>
              {myManagers.map(m => (
                <button
                  key={m.user.id}
                  onClick={() => handleSelectSubject(m.user.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors mb-1 ${
                    selectedSubjectId === m.user.id
                      ? 'bg-orange-600 text-white border-orange-600'
                      : 'bg-orange-50 text-orange-700 border-orange-200 hover:border-orange-400'
                  }`}
                >
                  {m.user.name}
                  <span className="block text-xs opacity-60">Manager</span>
                </button>
              ))}
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Rate teammates</p>
            {teammates.length === 0 && <p className="text-sm text-gray-400">No teammates yet.</p>}
            {teammates.map(m => (
              <button
                key={m.user.id}
                onClick={() => handleSelectSubject(m.user.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-medium transition-colors mb-1 ${
                  selectedSubjectId === m.user.id
                    ? 'bg-gray-800 text-white border-gray-800'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                {m.user.name}
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="flex-1">
          {/* Empty state */}
          {selectedSubjectId === null && (tab === 'skills' ? skillsView : leadershipView) === 'evaluate' && (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm border border-dashed rounded-xl">
              Select a person to rate, or view your own 360° profile
            </div>
          )}

          {/* ── SKILLS tab ─────────────────────────────────────────────────── */}
          {tab === 'skills' && (
            <>
              {selectedSubjectId === null && skillsView === 'summary' && (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">How others see my skills</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Aggregated peer ratings — individual responses are anonymous</p>
                  </div>
                  {skillsSummary
                    ? <SummaryView summary={skillsSummary} skills={allSkills} selfAssessment={mySelfAssessment} />
                    : <p className="text-sm text-gray-400">Loading…</p>}
                </>
              )}

              {selectedSubjectId && (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">Rate {selectedSubject?.user.name}'s skills</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Your evaluation is anonymous</p>
                  </div>
                  <form onSubmit={handleSkillsSubmit} className="space-y-5">
                    {allSkills.map(skill => (
                      <div key={skill.id} className="space-y-2">
                        <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                        <div className="flex gap-2 flex-wrap">
                          {[0, 1, 2, 3, 4].map(lvl => (
                            <button
                              key={lvl} type="button"
                              onClick={() => { setLevels(prev => ({ ...prev, [skill.id]: lvl })); setSkillsSaved(false) }}
                              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                                (levels[skill.id] ?? 0) === lvl ? LEVEL_ACTIVE[lvl] : LEVEL_COLORS[lvl] + ' hover:opacity-80'
                              }`}
                            >
                              {lvl} — {LEVEL_LABELS[lvl]}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-4">
                      <button type="submit" disabled={skillsSaving}
                        className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50">
                        {skillsSaving ? 'Saving…' : 'Submit evaluation'}
                      </button>
                      {skillsSaved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
                    </div>
                  </form>
                </>
              )}
            </>
          )}

          {/* ── LEADERSHIP tab ─────────────────────────────────────────────── */}
          {tab === 'leadership' && (
            <>
              {selectedSubjectId === null && leadershipView === 'summary' && (
                <>
                  <div className="mb-4">
                    <h2 className="text-lg font-semibold text-gray-800">How others see my leadership</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Aggregated peer ratings — individual responses are anonymous</p>
                  </div>
                  {leadershipSummary
                    ? <LeadershipSummaryView summary={leadershipSummary} selfLeadership={myLeadershipSelf} />
                    : <p className="text-sm text-gray-400">Loading…</p>}
                </>
              )}

              {selectedSubjectId && (
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
                  <form onSubmit={handleLeadershipSubmit} className="space-y-6">
                    {thirdPersonQuestions(selectedSubject?.user.name ?? 'This person').map((q, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <label className="text-sm text-gray-700 leading-snug">
                            <span className="font-semibold text-gray-400 mr-2">Q{i + 1}.</span>
                            {q}
                          </label>
                          <span className="shrink-0 w-8 text-center font-bold text-blue-700">
                            {leadershipAnswers[i]}
                          </span>
                        </div>
                        <input
                          type="range" min={1} max={10}
                          value={leadershipAnswers[i]}
                          onChange={e => setLeadershipAnswers(prev => prev.map((a, idx) => idx === i ? Number(e.target.value) : a))}
                          className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1 — Never</span><span>10 — Always</span>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 pt-4">
                      <button type="submit" disabled={leadershipSaving}
                        className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50">
                        {leadershipSaving ? 'Saving…' : 'Submit leadership evaluation'}
                      </button>
                      {leadershipSaved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
                    </div>
                  </form>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) <= 0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aligned</span>
  if (delta < -0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⚠ Blind spot</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">✨ Hidden strength</span>
}

function SummaryView({
  summary, skills, selfAssessment = [],
}: {
  summary: SkillSummary
  skills: { id: string; name: string }[]
  selfAssessment?: { skillId: string; level: number }[]
}) {
  if (summary.totalEvaluators === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm border border-dashed rounded-xl">
        No peer evaluations yet.
      </div>
    )
  }
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        <span className="font-semibold text-gray-800">{summary.totalEvaluators}</span> peer{summary.totalEvaluators === 1 ? '' : 's'} evaluated. Individual responses are anonymous.
      </p>
      <div className="space-y-6">
        {skills.filter(s => summary.skills[s.id]).map(skill => {
          const data = summary.skills[skill.id]!
          const selfLevel = selfAssessment.find(s => s.skillId === skill.id)?.level
          const hasSelf = selfLevel !== undefined
          const delta = hasSelf ? data.average - selfLevel : null
          return (
            <div key={skill.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800">{skill.name}</span>
                <div className="flex items-center gap-2">
                  {delta !== null && <DeltaBadge delta={delta} />}
                  <span className="text-gray-400 text-xs">{data.count} peer{data.count === 1 ? '' : 's'}</span>
                </div>
              </div>
              <div className="space-y-1.5">
                {hasSelf && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0 text-right">Me</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${LEVEL_BAR[selfLevel]}`} style={{ width: `${(selfLevel / 4) * 100}%` }} />
                    </div>
                    <span className="text-xs text-gray-500 w-24 shrink-0">{selfLevel} — {LEVEL_LABELS[selfLevel]}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-16 shrink-0 text-right">Peers</span>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full opacity-50 ${LEVEL_BAR[Math.round(data.average)]}`} style={{ width: `${(data.average / 4) * 100}%` }} />
                  </div>
                  <span className="text-xs text-gray-500 w-24 shrink-0">{data.average.toFixed(1)} — {LEVEL_LABELS[Math.round(data.average)]}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

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
        No peer leadership evaluations yet.
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

      {/* Archetype row */}
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

      {/* Behavior bars */}
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
