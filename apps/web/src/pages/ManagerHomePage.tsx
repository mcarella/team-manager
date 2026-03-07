import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'
import TeamCoverageTable from '../components/TeamCoverageTable.js'

const API = 'http://localhost:3001'

const LEVEL_LABELS: Record<number, string> = {
  0: "Don't know", 1: 'Know theory', 2: 'Autonomous', 3: 'Master', 4: 'Can teach',
}
const LEVEL_BAR: Record<number, string> = {
  0: 'bg-gray-400', 1: 'bg-blue-500', 2: 'bg-green-600', 3: 'bg-purple-600', 4: 'bg-amber-500',
}

interface PeerSkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

export default function ManagerHomePage() {
  const { currentUserId, currentRole, teams, members, roles, managerTeamIds, addTeam, assignTeamToManager } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [peerSummary, setPeerSummary] = useState<PeerSkillSummary | null>(null)

  useEffect(() => {
    if (!currentUserId) return
    fetch(`${API}/peer-assessments/skills/${currentUserId}/summary`)
      .then(r => r.json())
      .then(setPeerSummary)
      .catch(() => {})
  }, [currentUserId])

  if (!currentUserId || currentRole !== 'manager') {
    navigate('/', { replace: true })
    return null
  }

  const myTeamIds = managerTeamIds[currentUserId] ?? []
  const myTeams = teams.filter(t => myTeamIds.includes(t.id))

  // Skill name lookup
  const nameMap = new Map<string, string>()
  for (const r of roles) {
    for (const s of r.skills) if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
  }

  // Self-assessment for delta view
  const myProfile = members.find(m => m.user.id === currentUserId)
  const mySkills = myProfile?.skills ?? []

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    if (teams.some(t => t.name.toLowerCase() === trimmed.toLowerCase())) {
      setError(`A team named "${trimmed}" already exists.`)
      return
    }
    const id = crypto.randomUUID()
    addTeam({ id, orgId: 'default', name: trimmed })
    assignTeamToManager(currentUserId, id)
    setName('')
    setError('')
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-lg">
        <p className="text-sm text-gray-400">Manager</p>
        <h1 className="text-3xl font-bold">{currentUserId}</h1>
      </div>

      {/* Create team */}
      <form onSubmit={handleCreate} className="w-full max-w-lg flex gap-3">
        <input
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setError('') }}
          placeholder="New team name..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700"
        >
          Create team
        </button>
      </form>
      {error && <p className="text-sm text-red-600 -mt-4 w-full max-w-lg">{error}</p>}

      {/* How my team rates me */}
      <div className="w-full max-w-lg space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">How my team rates me</h2>
        {!peerSummary ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : peerSummary.totalEvaluators === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No skill evaluations from your team yet.</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-4">
            <p className="text-xs text-gray-500">
              <span className="font-semibold text-gray-800">{peerSummary.totalEvaluators}</span> team member{peerSummary.totalEvaluators !== 1 ? 's' : ''} evaluated your skills. Individual responses are anonymous.
            </p>
            <div className="space-y-4">
              {Object.entries(peerSummary.skills)
                .sort(([, a], [, b]) => b.average - a.average)
                .map(([skillId, data]) => {
                  const selfSkill = mySkills.find(s => s.skillId === skillId)
                  const delta = selfSkill !== undefined ? data.average - selfSkill.level : null
                  return (
                    <div key={skillId} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">{nameMap.get(skillId) ?? skillId}</span>
                        <div className="flex items-center gap-2">
                          {delta !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              Math.abs(delta) <= 0.5 ? 'bg-green-100 text-green-700' :
                              delta < 0 ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {Math.abs(delta) <= 0.5 ? 'Aligned' : delta < 0 ? '⚠ Blind spot' : '✨ Hidden strength'}
                            </span>
                          )}
                          <span className="text-xs text-gray-400">{data.count} eval{data.count !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      {selfSkill !== undefined && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Me</span>
                          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${LEVEL_BAR[selfSkill.level]}`} style={{ width: `${(selfSkill.level / 4) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-20 shrink-0">{selfSkill.level} — {LEVEL_LABELS[selfSkill.level]}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Team</span>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full opacity-60 ${LEVEL_BAR[Math.round(data.average)]}`} style={{ width: `${(data.average / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-500 w-20 shrink-0">{data.average.toFixed(1)} — {LEVEL_LABELS[Math.round(data.average)]}</span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* 360° Coverage dashboard */}
      {myTeams.length > 0 && (
        <div className="w-full max-w-lg space-y-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">360° Coverage</h2>
          {myTeams.map(team => (
            <div key={team.id} className="space-y-2">
              {myTeams.length > 1 && (
                <p className="text-xs font-medium text-gray-500">{team.name}</p>
              )}
              <TeamCoverageTable members={team.members} />
            </div>
          ))}
        </div>
      )}

      {/* Team list */}
      <div className="w-full max-w-lg space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">My Teams</h2>
        {myTeams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No teams yet.</p>
            <p className="text-sm mt-1">Create your first team above.</p>
          </div>
        ) : (
          myTeams.map(team => (
            <Link
              key={team.id}
              to={`/teams/${team.id}`}
              className="flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all"
            >
              <div>
                <p className="font-semibold text-gray-800">{team.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                </p>
              </div>
              <span className="text-gray-400 text-sm">→</span>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}
