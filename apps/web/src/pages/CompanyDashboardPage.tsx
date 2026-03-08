import { Link, useNavigate } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
import { useStore } from '../store/index.js'
import MemberList from '../components/MemberList.js'

export default function CompanyDashboardPage() {
  const { currentUserId, currentRole, teams, members, roles, managerTeamIds } = useStore()
  const withCVF = members.filter(m => m.cvf).length
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
      <div className="w-full max-w-4xl">
        <p className="text-sm text-gray-400">{currentUserId}</p>
        <h1 className="text-3xl font-bold">Company Dashboard</h1>
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
          <p className="text-3xl font-bold text-purple-600">{withCVF}</p>
          <p className="text-sm text-gray-500 mt-1">With CVF assessment</p>
        </div>
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
          <MemberList members={members} roles={roles} />
        )}
      </div>
    </main>
  )
}
