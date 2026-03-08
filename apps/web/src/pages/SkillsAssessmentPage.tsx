import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

const API = 'http://localhost:3001'

// ── Constants ─────────────────────────────────────────────────────────────────

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

interface SkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

type MainTab = 'mine' | 'rate' | 'others'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function SkillsAssessmentPage() {
  const { currentUserId, saveSkillAssessment, members, roles, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  const [mainTab, setMainTab] = useState<MainTab>('mine')

  // My Skills state
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [saved, setSaved] = useState(false)
  const [levels, setLevels] = useState<Record<string, number>>({})

  // Feedback to Others state
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null)
  const [peerLevels, setPeerLevels] = useState<Record<string, number>>({})
  const [peerSaving, setPeerSaving] = useState(false)
  const [peerSaved, setPeerSaved] = useState(false)
  const [evaluatedIds, setEvaluatedIds] = useState<Set<string>>(new Set())

  // How Others See Me state
  const [summary, setSummary] = useState<SkillSummary | null>(null)
  const [summaryLoaded, setSummaryLoaded] = useState(false)

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
  const teammates = members.filter(
    m => m.user.id !== userId && !myManagerIds.has(m.user.id) && m.user.role !== 'manager'
  )

  const existingSkills = members.find(m => m.user.id === userId)?.skills ?? []
  const selectedRole = roles.find(r => r.id === selectedRoleId)
  const commonRole = roles.find(r => r.id === 'common')

  const allSkills = (() => {
    const roleSkills = selectedRole?.skills ?? []
    const commonSkills = (commonRole && selectedRoleId !== 'common')
      ? commonRole.skills.filter(cs => !roleSkills.some(rs => rs.id === cs.id))
      : []
    return [...roleSkills, ...commonSkills]
  })()

  const allUniqueSkills = roles
    .flatMap(r => r.skills)
    .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)

  // Load "how others see me" when tab opens
  useEffect(() => {
    if (mainTab !== 'others') return
    if (summaryLoaded) return
    setSummary(null)
    fetch(`${API}/peer-assessments/skills/${userId}/summary`)
      .then(r => r.json())
      .then((data: SkillSummary) => { setSummary(data); setSummaryLoaded(true) })
      .catch(() => {})
  }, [mainTab, userId, summaryLoaded])

  // My Skills handlers
  const handleStart = () => {
    if (!selectedRoleId) return
    const prefill: Record<string, number> = {}
    for (const s of allSkills) prefill[s.id] = 0
    for (const sa of existingSkills) {
      if (sa.skillId in prefill) prefill[sa.skillId] = sa.level
    }
    setLevels(prefill)
    setStarted(true)
    setSaved(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    for (const skill of allSkills) {
      saveSkillAssessment({
        userId,
        skillId: skill.id,
        level: (levels[skill.id] ?? 0) as 0 | 1 | 2 | 3 | 4,
      })
    }
    setSaved(true)
  }

  // Rate Others handlers
  const handleSelectSubject = (subjectId: string) => {
    setSelectedSubjectId(subjectId)
    setPeerSaved(false)
    const prefill: Record<string, number> = {}
    for (const s of allUniqueSkills) prefill[s.id] = 0
    setPeerLevels(prefill)
  }

  const handlePeerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSubjectId) return
    setPeerSaving(true)
    try {
      await Promise.all(
        allUniqueSkills.map(skill =>
          fetch(`${API}/peer-assessments/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assessorId: userId,
              subjectId: selectedSubjectId,
              skillId: skill.id,
              level: peerLevels[skill.id] ?? 0,
            }),
          })
        )
      )
      setPeerSaved(true)
      setEvaluatedIds(prev => new Set([...prev, selectedSubjectId]))
    } finally {
      setPeerSaving(false)
    }
  }

  const selectedSubject = members.find(m => m.user.id === selectedSubjectId)
  const roleSpecificSkills = selectedRole?.skills ?? []
  const commonSkills = (commonRole && selectedRoleId !== 'common')
    ? commonRole.skills.filter(cs => !roleSpecificSkills.some(rs => rs.id === cs.id))
    : []

  const TABS: { key: MainTab; label: string }[] = [
    { key: 'mine',   label: 'My Skills' },
    { key: 'others', label: 'How Others See Me' },
    { key: 'rate',   label: 'Feedback to Others' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Skills</h1>
        <p className="text-gray-500 mt-2">Self-assessment and 360° peer feedback.</p>
      </div>

      {/* Tab switcher */}
      <div className="w-full max-w-2xl flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mainTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── My Skills ─────────────────────────────────────────────────────────── */}
      {mainTab === 'mine' && (
        <div className="w-full max-w-2xl">
          {!started ? (
            <div className="flex flex-col gap-4 w-full max-w-sm mx-auto">
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Your role</label>
                <div className="grid grid-cols-2 gap-2">
                  {roles.filter(r => r.id !== 'common').map(role => {
                    const isEvaluated = role.skills.some(s => existingSkills.some(es => es.skillId === s.id))
                    const isSelected = selectedRoleId === role.id
                    return (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => setSelectedRoleId(role.id)}
                        className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors text-left ${
                          isSelected
                            ? 'bg-green-600 text-white border-green-600'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <span>{role.name}</span>
                          {isEvaluated && <span className={`text-xs font-bold ${isSelected ? 'text-green-200' : 'text-green-600'}`}>✓</span>}
                        </span>
                        <span className="block text-xs mt-0.5 opacity-70">{role.skills.length} skills</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {existingSkills.length > 0 && (
                <p className="text-xs text-amber-600">You have a saved skills assessment. Start to update it.</p>
              )}

              <button
                onClick={handleStart}
                disabled={!selectedRoleId}
                className="py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                  {selectedRole?.name}
                </span>
                {commonSkills.length > 0 && (
                  <span className="text-xs text-gray-400">+ {commonSkills.length} cross-role skills</span>
                )}
              </div>

              {roleSpecificSkills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {selectedRole?.name} Skills
                  </h3>
                  {roleSpecificSkills.map(skill => (
                    <SkillRow
                      key={skill.id}
                      name={skill.name}
                      level={levels[skill.id] ?? 0}
                      onSetLevel={lvl => { setLevels(prev => ({ ...prev, [skill.id]: lvl })); setSaved(false) }}
                    />
                  ))}
                </div>
              )}

              {commonSkills.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Cross-Role Skills</h3>
                  {commonSkills.map(skill => (
                    <SkillRow
                      key={skill.id}
                      name={skill.name}
                      level={levels[skill.id] ?? 0}
                      onSetLevel={lvl => { setLevels(prev => ({ ...prev, [skill.id]: lvl })); setSaved(false) }}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-4">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700"
                >
                  Save skills
                </button>
                {saved && <span className="text-sm text-green-700 font-medium">Saved!</span>}
              </div>

              {saved && (
                <div className="flex gap-4 pt-2">
                  <Link to="/onboarding" className="text-sm text-blue-600 hover:underline">← Back</Link>
                </div>
              )}
            </form>
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
                Select a person to rate their skills
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Rate {selectedSubject?.user.name}'s skills</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Your evaluation is anonymous</p>
                </div>
                <form onSubmit={handlePeerSubmit} className="space-y-5">
                  {allUniqueSkills.map(skill => (
                    <div key={skill.id} className="space-y-2">
                      <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                      <div className="flex gap-2 flex-wrap">
                        {[0, 1, 2, 3, 4].map(lvl => (
                          <button
                            key={lvl} type="button"
                            onClick={() => { setPeerLevels(prev => ({ ...prev, [skill.id]: lvl })); setPeerSaved(false) }}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                              (peerLevels[skill.id] ?? 0) === lvl ? LEVEL_ACTIVE[lvl] : LEVEL_COLORS[lvl] + ' hover:opacity-80'
                            }`}
                          >
                            {lvl} — {LEVEL_LABELS[lvl]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-4 pt-4">
                    <button type="submit" disabled={peerSaving}
                      className="px-6 py-2.5 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 disabled:opacity-50">
                      {peerSaving ? 'Saving…' : 'Submit evaluation'}
                    </button>
                    {peerSaved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
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
          {!summary ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <SkillSummaryView summary={summary} skills={allUniqueSkills} selfAssessment={existingSkills} />
          )}
        </div>
      )}
    </main>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SkillRow({ name, level, onSetLevel }: { name: string; level: number; onSetLevel: (lvl: number) => void }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-gray-800">{name}</p>
      <div className="flex gap-2 flex-wrap">
        {[0, 1, 2, 3, 4].map(lvl => (
          <button
            key={lvl}
            type="button"
            onClick={() => onSetLevel(lvl)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              level === lvl ? LEVEL_ACTIVE[lvl] : LEVEL_COLORS[lvl] + ' hover:opacity-80'
            }`}
          >
            {lvl} — {LEVEL_LABELS[lvl]}
          </button>
        ))}
      </div>
    </div>
  )
}

function DeltaBadge({ delta }: { delta: number }) {
  if (Math.abs(delta) <= 0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Aligned</span>
  if (delta < -0.5)
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">⚠ Blind spot</span>
  return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">✨ Hidden strength</span>
}

function SkillSummaryView({
  summary, skills, selfAssessment = [],
}: {
  summary: SkillSummary
  skills: { id: string; name: string }[]
  selfAssessment?: { skillId: string; level: number }[]
}) {
  if (summary.totalEvaluators === 0) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm border border-dashed rounded-xl">
        No peer evaluations yet. Ask your teammates to evaluate you in their Skills tab.
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
