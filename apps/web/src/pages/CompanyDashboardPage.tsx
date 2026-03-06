import { Link, useNavigate } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
import { useStore } from '../store/index.js'

export default function CompanyDashboardPage() {
  const { currentUserId, currentRole, teams, members, companyProfile, managerTeamIds, logout } = useStore()
  const navigate = useNavigate()

  if (!currentUserId || currentRole !== 'company') {
    navigate('/', { replace: true })
    return null
  }

  const totalMembers = new Set(teams.flatMap(t => t.members.map(m => m.user.id))).size

  // Reverse lookup: teamId → manager name
  const teamManager = new Map<string, string>()
  for (const [managerId, teamIds] of Object.entries(managerTeamIds)) {
    for (const tid of teamIds) {
      teamManager.set(tid, managerId)
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">Company view</p>
          <h1 className="text-3xl font-bold">{currentUserId}</h1>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          Log out
        </button>
      </div>

      {/* Summary cards */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-orange-600">{teams.length}</p>
          <p className="text-sm text-gray-500 mt-1">Teams</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalMembers}</p>
          <p className="text-sm text-gray-500 mt-1">Individuals</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-purple-600">{companyProfile ? 'Defined' : 'Missing'}</p>
          <p className="text-sm text-gray-500 mt-1">Culture Profile</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="w-full max-w-4xl flex gap-3">
        <Link to="/reteaming" className="flex-1 text-center px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700">
          Reteaming
        </Link>
        <Link to="/company-profile" className="flex-1 text-center px-4 py-2.5 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700">
          Company Culture Profile
        </Link>
        <Link to="/roles" className="flex-1 text-center px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700">
          Roles &amp; Skills
        </Link>
      </div>

      {/* Teams */}
      <div className="w-full max-w-4xl space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">All Teams</h2>
        {teams.length === 0 ? (
          <p className="text-center py-12 text-gray-400">No teams created yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map(team => {
              const kiviat = computeKiviatData(team.members)
              const archetypes = Object.entries(kiviat.archetypeDistribution)
                .filter(([, v]) => v > 0)
                .sort(([, a], [, b]) => b - a)
              const manager = teamManager.get(team.id)
              return (
                <Link
                  key={team.id}
                  to={`/teams/${team.id}`}
                  className="flex flex-col gap-2 px-5 py-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">{team.name}</p>
                      {manager && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-orange-50 text-orange-600">
                          {manager}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-400">{team.members.length} members</span>
                  </div>
                  {archetypes.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {archetypes.map(([arch, count]) => (
                        <span key={arch} className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-600 capitalize">
                          {arch} ({count})
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* All individuals */}
      <div className="w-full max-w-4xl space-y-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">All Individuals</h2>
        {members.length === 0 ? (
          <p className="text-center py-8 text-gray-400">No individual profiles yet.</p>
        ) : (
          <div className="space-y-2">
            {members.map(m => {
              const teamNames = teams
                .filter(t => t.members.some(tm => tm.user.id === m.user.id))
                .map(t => t.name)
              return (
                <div
                  key={m.user.id}
                  className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{m.user.name}</p>
                    <p className="text-xs text-gray-400">
                      {teamNames.length > 0 ? teamNames.join(', ') : 'No team'}
                    </p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {m.leadership ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {m.leadership.archetype}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 bg-gray-100">no leadership</span>
                    )}
                    {m.cvf && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">CVF</span>
                    )}
                    {m.skills.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                        {m.skills.length} skills
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
