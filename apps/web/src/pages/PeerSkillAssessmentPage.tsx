import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

const API = 'http://localhost:3001'

const LEVEL_LABELS: Record<number, string> = {
  0: "Don't know",
  1: 'Know theory',
  2: 'Autonomous',
  3: 'Master',
  4: 'Can teach',
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
  0: 'bg-gray-400',
  1: 'bg-blue-500',
  2: 'bg-green-600',
  3: 'bg-purple-600',
  4: 'bg-amber-500',
}

interface SkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

export default function PeerSkillAssessmentPage() {
  const { currentUserId, members, roles, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [levels, setLevels] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [summary, setSummary] = useState<SkillSummary | null>(null)
  const [view, setView] = useState<'evaluate' | 'summary'>('evaluate')

  const userId = currentUserId ?? ''
  if (!userId) {
    navigate('/', { replace: true })
    return null
  }

  // Find teams this member belongs to
  const myTeams = teams.filter(t => t.members.some(m => m.user.id === userId))
  // Find manager(s) for those teams
  const myManagerIds = new Set(
    myTeams.flatMap(t =>
      Object.entries(managerTeamIds)
        .filter(([, tids]) => tids.includes(t.id))
        .map(([mid]) => mid)
    )
  )
  const myManagers = members.filter(m => myManagerIds.has(m.user.id))
  const teammates = members.filter(m => m.user.id !== userId && !myManagerIds.has(m.user.id) && m.user.role !== 'manager')

  const allSkills = roles.flatMap(r => r.skills).filter(
    (s, i, arr) => arr.findIndex(x => x.id === s.id) === i
  )

  const mySelfAssessment = members.find(m => m.user.id === userId)?.skills ?? []

  const handleSelectMyProfile = async () => {
    setSelectedSubjectId(null)
    setView('summary')
    setSummary(null)
    const res = await fetch(`${API}/peer-assessments/skills/${userId}/summary`)
    const data = await res.json() as SkillSummary
    setSummary(data)
  }

  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setSaved(false)
    setSummary(null)
    setView('evaluate')
    const prefill: Record<string, number> = {}
    for (const s of allSkills) prefill[s.id] = 0
    setLevels(prefill)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    setSaving(true)
    try {
      await Promise.all(
        allSkills.map(skill =>
          fetch(`${API}/peer-assessments/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessorId: userId,
              subjectId: selectedSubjectId,
              skillId: skill.id,
              level: levels[skill.id] ?? 0,
            }),
          })
        )
      )
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  const handleViewSummary = async () => {
    if (!selectedSubjectId) return
    const res = await fetch(`${API}/peer-assessments/skills/${selectedSubjectId}/summary`)
    const data = await res.json() as SkillSummary
    setSummary(data)
    setView('summary')
  }

  const selectedSubject = members.find(m => m.user.id === selectedSubjectId)

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Peer Skill Assessment</h1>
        <p className="text-gray-500 mt-2">
          Rate a teammate's skills. Your evaluation is <span className="font-medium text-gray-700">anonymous</span> — they will only see aggregated results.
        </p>
      </div>

      <div className="w-full max-w-2xl flex gap-6">
        {/* Sidebar */}
        <div className="w-48 shrink-0 space-y-2">
          {/* My 360° profile */}
          <button
            onClick={handleSelectMyProfile}
            className={`w-full text-left px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
              selectedSubjectId === null && view === 'summary'
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:border-indigo-400'
            }`}
          >
            <span className="block text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">My profile</span>
            How others rate me
          </button>

          {/* Rate my manager */}
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
            {teammates.length === 0 && (
              <p className="text-sm text-gray-400">No teammates yet. Use /seed to add some.</p>
            )}
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
          {/* Default empty state */}
          {selectedSubjectId === null && view === 'evaluate' && (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm border border-dashed rounded-xl">
              Select a teammate to rate, or view your own 360° profile
            </div>
          )}

          {/* My 360° profile */}
          {selectedSubjectId === null && view === 'summary' && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">How others see me</h2>
                <p className="text-xs text-gray-400 mt-0.5">Aggregated peer ratings — individual responses are anonymous</p>
              </div>
              {summary
                ? <SummaryView summary={summary} skills={allSkills} selfAssessment={mySelfAssessment} />
                : <p className="text-sm text-gray-400">Loading…</p>
              }
            </>
          )}

          {/* Rate a teammate */}
          {selectedSubjectId && (
            <>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Rate {selectedSubject?.user.name}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Your evaluation is anonymous</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {allSkills.map(skill => (
                  <div key={skill.id} className="space-y-2">
                    <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                    <div className="flex gap-2 flex-wrap">
                      {[0, 1, 2, 3, 4].map(lvl => (
                        <button
                          key={lvl}
                          type="button"
                          onClick={() => {
                            setLevels(prev => ({ ...prev, [skill.id]: lvl }))
                            setSaved(false)
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                            (levels[skill.id] ?? 0) === lvl
                              ? LEVEL_ACTIVE[lvl]
                              : LEVEL_COLORS[lvl] + ' hover:opacity-80'
                          }`}
                        >
                          {lvl} — {LEVEL_LABELS[lvl]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Submit evaluation'}
                  </button>
                  {saved && (
                    <span className="text-sm text-green-700 font-medium">
                      ✓ Submitted anonymously
                    </span>
                  )}
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  )
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) <= 0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aligned</span>
  if (delta < -0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⚠ Blind spot</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">✨ Hidden strength</span>
}

function SummaryView({
  summary,
  skills,
  selfAssessment = [],
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
        <span className="font-semibold text-gray-800">{summary.totalEvaluators}</span> peer
        {summary.totalEvaluators === 1 ? '' : 's'} evaluated. Individual responses are anonymous.
      </p>

      <div className="space-y-6">
        {skills
          .filter(s => summary.skills[s.id])
          .map(skill => {
            const data = summary.skills[skill.id]!
            const peerAvg = data.average
            const selfLevel = selfAssessment.find(s => s.skillId === skill.id)?.level
            const hasSelf = selfLevel !== undefined
            const delta = hasSelf ? peerAvg - selfLevel : null

            return (
              <div key={skill.id} className="space-y-2">
                {/* Skill name + badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-800">{skill.name}</span>
                  <div className="flex items-center gap-2">
                    {delta !== null && <DeltaBadge delta={delta} />}
                    <span className="text-gray-400 text-xs">{data.count} peer{data.count === 1 ? '' : 's'}</span>
                  </div>
                </div>

                {/* Two bars */}
                <div className="space-y-1.5">
                  {/* Me bar */}
                  {hasSelf && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16 shrink-0 text-right">Me</span>
                      <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${LEVEL_BAR[selfLevel]}`}
                          style={{ width: `${(selfLevel / 4) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-24 shrink-0">
                        {selfLevel} — {LEVEL_LABELS[selfLevel]}
                      </span>
                    </div>
                  )}

                  {/* Peers bar */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 shrink-0 text-right">Peers</span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all opacity-50 ${LEVEL_BAR[Math.round(peerAvg)]}`}
                        style={{ width: `${(peerAvg / 4) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-24 shrink-0">
                      {peerAvg.toFixed(1)} — {LEVEL_LABELS[Math.round(peerAvg)]}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </div>
  )
}
