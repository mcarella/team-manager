import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeLeadershipScores, computeArchetype } from '@team-manager/core'
import type { CVFAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import { API_BASE } from '../lib/api.js'
import { LEVEL_LABELS, LEVEL_COLORS, LEVEL_ACTIVE } from '../lib/skill-levels.js'
import { thirdPersonQuestions } from '../lib/leadership-constants.js'
import TabSwitcher from '../components/shared/TabSwitcher.js'

type Tab = 'leadership' | 'skills' | 'cvf'

// ── Page ─────────────────────────────────────────────────────────────────────

export default function RateManagerPage() {
  const { currentUserId, currentRole, members, roles, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('leadership')

  // Leadership state
  const [leadershipAnswers, setLeadershipAnswers] = useState<number[]>(Array(12).fill(5))
  const [leadershipSaving, setLeadershipSaving] = useState(false)
  const [leadershipSaved, setLeadershipSaved] = useState(false)

  // Skills state
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({})
  const [skillsSaving, setSkillsSaving] = useState(false)
  const [skillsSaved, setSkillsSaved] = useState(false)

  // CVF state
  const [cvfSaved, setCVFSaved] = useState(false)

  const userId = currentUserId ?? ''
  if (!userId || currentRole !== 'member') { navigate('/', { replace: true }); return null }

  // Find my manager
  const myTeams = teams.filter(t => t.members.some(m => m.user.id === userId))
  const myManagerIds = new Set(
    myTeams.flatMap(t =>
      Object.entries(managerTeamIds)
        .filter(([, tids]) => tids.includes(t.id))
        .map(([mid]) => mid)
    )
  )
  const myManagers = members.filter(m => myManagerIds.has(m.user.id))

  // For simplicity: rate the first manager. If multiple, could add a picker.
  const manager = myManagers[0]

  if (!manager) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">You don't have a manager assigned yet.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">← Back</button>
      </main>
    )
  }

  const managerId = manager.user.id
  const managerName = manager.user.name

  const allSkills = roles
    .flatMap(r => r.skills)
    .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)

  // Prefetch previous leadership answers
  useEffect(() => {
    fetch(`${API_BASE}/peer-assessments/leadership/${managerId}/my-assessment/${userId}`)
      .then(r => r.json())
      .then((data: { answers: number[] } | null) => {
        if (data?.answers) setLeadershipAnswers(data.answers)
      })
      .catch(() => {})
    const prefill: Record<string, number> = {}
    for (const s of allSkills) prefill[s.id] = 0
    setSkillLevels(prefill)
  }, [managerId, userId])

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLeadershipSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLeadershipSaving(true)
    try {
      await fetch(`${API_BASE}/peer-assessments/leadership`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessorId: userId, subjectId: managerId, answers: leadershipAnswers }),
      })
      setLeadershipSaved(true)
    } finally {
      setLeadershipSaving(false)
    }
  }

  const handleSkillsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSkillsSaving(true)
    try {
      await Promise.all(
        allSkills.map(skill =>
          fetch(`${API_BASE}/peer-assessments/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assessorId: userId, subjectId: managerId, skillId: skill.id, level: skillLevels[skill.id] ?? 0 }),
          })
        )
      )
      setSkillsSaved(true)
    } finally {
      setSkillsSaving(false)
    }
  }

  const handleCVFSubmit = async (assessment: CVFAssessment) => {
    await fetch(`${API_BASE}/peer-assessments/cvf`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assessorId: userId, subjectId: managerId, categories: assessment.categories, results: assessment.results }),
    })
    setCVFSaved(true)
  }

  const TABS: { key: Tab; label: string }[] = [
    { key: 'leadership', label: 'Leadership' },
    { key: 'skills',     label: 'Skills' },
    { key: 'cvf',        label: 'Culture' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      {/* Header */}
      <div className="w-full max-w-2xl">
        <p className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Rate my manager</p>
        <h1 className="text-3xl font-bold">{managerName}</h1>
        <p className="text-gray-500 mt-1">
          Your evaluation is <span className="font-medium text-gray-700">anonymous</span> — they only see aggregated results.
        </p>
      </div>

      {/* Tab switcher */}
      <TabSwitcher tabs={TABS} active={tab} onChange={setTab} />

      {/* ── Leadership ──────────────────────────────────────────────────────── */}
      {tab === 'leadership' && (
        <div className="w-full max-w-2xl">
          <p className="text-xs text-indigo-600 font-medium mb-6">
            Rate each statement 1–10 based on how well it describes {managerName}.
          </p>
          <form onSubmit={handleLeadershipSubmit} className="space-y-6">
            {thirdPersonQuestions(managerName).map((q, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <label className="text-sm text-gray-700 leading-snug">
                    <span className="font-semibold text-gray-400 mr-2">Q{i + 1}.</span>{q}
                  </label>
                  <span className="shrink-0 w-8 text-center font-bold text-blue-700">{leadershipAnswers[i]}</span>
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
                className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50">
                {leadershipSaving ? 'Saving…' : 'Submit evaluation'}
              </button>
              {leadershipSaved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
            </div>
          </form>
        </div>
      )}

      {/* ── Skills ──────────────────────────────────────────────────────────── */}
      {tab === 'skills' && (
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSkillsSubmit} className="space-y-5">
            {allSkills.map(skill => (
              <div key={skill.id} className="space-y-2">
                <p className="text-sm font-semibold text-gray-800">{skill.name}</p>
                <div className="flex gap-2 flex-wrap">
                  {[0, 1, 2, 3, 4].map(lvl => (
                    <button
                      key={lvl} type="button"
                      onClick={() => { setSkillLevels(prev => ({ ...prev, [skill.id]: lvl })); setSkillsSaved(false) }}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        (skillLevels[skill.id] ?? 0) === lvl ? LEVEL_ACTIVE[lvl] : LEVEL_COLORS[lvl] + ' hover:opacity-80'
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
                className="px-6 py-2.5 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 disabled:opacity-50">
                {skillsSaving ? 'Saving…' : 'Submit evaluation'}
              </button>
              {skillsSaved && <span className="text-sm text-green-700 font-medium">✓ Submitted anonymously</span>}
            </div>
          </form>
        </div>
      )}

      {/* ── CVF ─────────────────────────────────────────────────────────────── */}
      {tab === 'cvf' && (
        <div className="w-full max-w-2xl">
          {cvfSaved ? (
            <div className="text-center py-12 space-y-2">
              <p className="text-green-700 font-semibold text-lg">✓ CVF evaluation submitted</p>
              <p className="text-sm text-gray-400">Individual responses are anonymous.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6">
                How do you perceive <span className="font-medium text-gray-800">{managerName}</span>'s culture orientation?
                Distribute 100 points across 4 quadrants for each of 6 categories.
              </p>
              <CVFForm userId={`${userId}__rating__${managerId}`} onComplete={handleCVFSubmit} />
            </>
          )}
        </div>
      )}
    </main>
  )
}
