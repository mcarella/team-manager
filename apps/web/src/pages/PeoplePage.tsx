import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/index.js'
import MemberList from '../components/MemberList.js'

export default function PeoplePage() {
  const { currentUserId, currentRole, members, roles, teams, managerTeamIds } = useStore()
  const navigate = useNavigate()

  if (!currentUserId || currentRole !== 'company') {
    navigate('/', { replace: true })
    return null
  }

  const totalMembers = new Set(teams.flatMap(t => t.members.map(m => m.user.id))).size
  const withLeadership = members.filter(m => m.leadership).length
  const withSkills = members.filter(m => m.skills.length > 0).length

  // Reverse lookup: teamId → manager name, then memberId → team name
  const memberTeams = new Map<string, string[]>()
  for (const team of teams) {
    for (const m of team.members) {
      const existing = memberTeams.get(m.user.id) ?? []
      memberTeams.set(m.user.id, [...existing, team.name])
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold">People</h1>
        <p className="text-gray-500 mt-1">All individuals across your organisation.</p>
      </div>

      {/* Summary cards */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-blue-600">{totalMembers}</p>
          <p className="text-sm text-gray-500 mt-1">Total people</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-indigo-600">{withLeadership}</p>
          <p className="text-sm text-gray-500 mt-1">With leadership profile</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
          <p className="text-3xl font-bold text-green-600">{withSkills}</p>
          <p className="text-sm text-gray-500 mt-1">With skills assessment</p>
        </div>
      </div>

      {/* Member list */}
      <div className="w-full max-w-4xl">
        {members.length === 0 ? (
          <p className="text-center py-16 text-gray-400">No individual profiles yet.</p>
        ) : (
          <MemberList members={members} roles={roles} />
        )}
      </div>
    </main>
  )
}
