import { useState } from 'react'
import type { TeamMemberProfile, SkillRole } from '@team-manager/shared'
import MemberProfileModal, { type SectionType } from './MemberProfileModal.js'
import { ARCHETYPE_COLORS } from '../lib/archetype-colors.js'

interface Props {
  members: TeamMemberProfile[]
  roles?: SkillRole[]
  teamSize?: number
}

export default function MemberList({ members, roles = [], teamSize }: Props) {
  const [selected, setSelected] = useState<TeamMemberProfile | null>(null)
  const [initialSection, setInitialSection] = useState<SectionType | undefined>(undefined)
  const [query, setQuery] = useState('')

  function openAt(member: TeamMemberProfile, section?: SectionType) {
    setSelected(member)
    setInitialSection(section)
  }

  const sorted = [...members].sort((a, b) => a.user.name.localeCompare(b.user.name))
  const filtered = query.trim()
    ? sorted.filter(m => m.user.name.toLowerCase().includes(query.toLowerCase()))
    : sorted

  if (members.length === 0) {
    return <p className="text-sm text-gray-400">No members yet.</p>
  }

  return (
    <>
      <div className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search members…"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />

        {filtered.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No members match "{query}"</p>
        )}

        <div className="space-y-2">
          {filtered.map(member => {
            const { user, leadership, cvf, skills } = member
            return (
              <div
                key={user.id}
                onClick={() => openAt(member)}
                className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm cursor-pointer hover:border-gray-300 hover:shadow-md transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                    {user.role === 'manager' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700 shrink-0">Manager</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
                  {leadership ? (
                    <button
                      onClick={() => openAt(member, 'archetype')}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize hover:opacity-75 transition-opacity ${ARCHETYPE_COLORS[leadership.archetype] ?? 'bg-gray-100 text-gray-600'}`}
                    >
                      {leadership.archetype}
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 bg-gray-100">no assessment</span>
                  )}
                  {cvf && (
                    <button
                      onClick={() => openAt(member, 'cvf')}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:opacity-75 transition-opacity"
                    >
                      CVF
                    </button>
                  )}
                  {skills.length > 0 && (
                    <button
                      onClick={() => openAt(member, 'skills')}
                      className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:opacity-75 transition-opacity"
                    >
                      Skills
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <MemberProfileModal
          member={selected}
          roles={roles}
          {...(teamSize !== undefined ? { teamSize } : {})}
          {...(initialSection ? { initialSection } : {})}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
