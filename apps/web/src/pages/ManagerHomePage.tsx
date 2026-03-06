import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'

export default function ManagerHomePage() {
  const { currentUserId, currentRole, teams, managerTeamIds, addTeam, assignTeamToManager, logout } = useStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  if (!currentUserId || currentRole !== 'manager') {
    navigate('/', { replace: true })
    return null
  }

  const myTeamIds = managerTeamIds[currentUserId] ?? []
  const myTeams = teams.filter(t => myTeamIds.includes(t.id))

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
      <div className="w-full max-w-lg flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Manager</p>
          <h1 className="text-3xl font-bold">{currentUserId}</h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Log out
        </button>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-lg flex gap-3">
        <Link to="/company-profile" className="flex-1 text-center px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700">
          Company Culture
        </Link>
        <Link to="/roles" className="flex-1 text-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
          Roles &amp; Skills
        </Link>
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
