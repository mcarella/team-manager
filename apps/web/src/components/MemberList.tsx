import type { TeamMemberProfile } from '@team-manager/shared'

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700',
  coordinator: 'bg-orange-100 text-orange-700',
  peer:        'bg-blue-100 text-blue-700',
  coach:       'bg-green-100 text-green-700',
  strategist:  'bg-purple-100 text-purple-700',
}

interface Props {
  members: TeamMemberProfile[]
}

export default function MemberList({ members }: Props) {
  if (members.length === 0) {
    return <p className="text-sm text-gray-400">No members yet. Complete assessments to populate the team.</p>
  }

  return (
    <div className="space-y-2">
      {members.map(({ user, leadership, cvf, skills }) => (
        <div key={user.id} className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-400">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            {leadership && (
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ARCHETYPE_COLORS[leadership.archetype] ?? 'bg-gray-100 text-gray-600'}`}>
                {leadership.archetype}
              </span>
            )}
            {cvf && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                CVF
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
