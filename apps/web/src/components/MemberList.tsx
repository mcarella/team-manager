import { useState } from 'react'
import type { TeamMemberProfile, SkillRole } from '@team-manager/shared'
import ArchetypeCard from './ArchetypeCard.js'
import CVFRadarChart from './CVFRadarChart.js'

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700 hover:bg-red-200',
  coordinator: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  peer:        'bg-blue-100 text-blue-700 hover:bg-blue-200',
  coach:       'bg-green-100 text-green-700 hover:bg-green-200',
  strategist:  'bg-purple-100 text-purple-700 hover:bg-purple-200',
}

const LEVEL_LABELS = ['Don\'t know', 'Theory', 'Autonomous', 'Master', 'Can teach']
const LEVEL_COLORS = ['#9ca3af', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b']

type ModalType = 'archetype' | 'cvf' | 'skills'

interface Props {
  members: TeamMemberProfile[]
  roles?: SkillRole[]
}

export default function MemberList({ members, roles }: Props) {
  const [selected, setSelected] = useState<TeamMemberProfile | null>(null)
  const [modalType, setModalType] = useState<ModalType>('archetype')

  const openModal = (member: TeamMemberProfile, type: ModalType) => {
    setSelected(member)
    setModalType(type)
  }

  const closeModal = () => setSelected(null)

  // Build skill name lookup from roles
  const nameMap = new Map<string, string>()
  if (roles) {
    for (const r of roles) {
      for (const s of r.skills) {
        if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
      }
    }
  }

  if (members.length === 0) {
    return <p className="text-sm text-gray-400">No members yet.</p>
  }

  return (
    <>
      <div className="space-y-2">
        {members.map(member => {
          const { user, leadership, cvf, skills } = member
          return (
            <div
              key={user.id}
              className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
                <p className="text-xs text-gray-400">{skills.length} skill{skills.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {leadership ? (
                  <button
                    onClick={() => openModal(member, 'archetype')}
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize transition-colors cursor-pointer ${ARCHETYPE_COLORS[leadership.archetype] ?? 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    title="Click to see archetype detail"
                  >
                    {leadership.archetype}
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs text-gray-400 bg-gray-100">
                    no assessment
                  </span>
                )}
                {cvf ? (
                  <button
                    onClick={() => openModal(member, 'cvf')}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors cursor-pointer"
                    title="Click to see CVF profile"
                  >
                    CVF
                  </button>
                ) : null}
                {skills.length > 0 ? (
                  <button
                    onClick={() => openModal(member, 'skills')}
                    className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors cursor-pointer"
                    title="Click to see skills"
                  >
                    Skills
                  </button>
                ) : null}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div
            className="max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative">
              <button
                onClick={closeModal}
                className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-gray-500 hover:text-gray-800 hover:bg-white shadow text-sm"
              >
                ✕
              </button>

              {modalType === 'archetype' && selected.leadership && (
                <ArchetypeCard assessment={selected.leadership} />
              )}

              {modalType === 'cvf' && selected.cvf && (
                <div className="p-6 space-y-4 min-w-[360px]">
                  <h3 className="text-lg font-bold text-gray-800">{selected.user.name} — CVF Profile</h3>
                  <CVFRadarChart scores={selected.cvf.results} />
                  <div className="grid grid-cols-2 gap-2">
                    {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(q => (
                      <div key={q} className="bg-gray-50 rounded-xl px-3 py-2 text-center">
                        <p className="text-xs text-gray-500 capitalize">{q}</p>
                        <p className="text-lg font-bold text-gray-800">{selected.cvf!.results[q]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalType === 'skills' && selected.skills.length > 0 && (
                <div className="p-6 space-y-4 min-w-[360px]">
                  <h3 className="text-lg font-bold text-gray-800">{selected.user.name} — Skills</h3>
                  <div className="space-y-2">
                    {selected.skills
                      .slice()
                      .sort((a, b) => b.level - a.level)
                      .map(sa => {
                        const pct = (sa.level / 4) * 100
                        return (
                          <div key={sa.skillId} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-gray-700">
                                {nameMap.get(sa.skillId) ?? sa.skillId}
                              </span>
                              <span style={{ color: LEVEL_COLORS[sa.level] }} className="font-medium">
                                {sa.level} — {LEVEL_LABELS[sa.level]}
                              </span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${pct}%`, backgroundColor: LEVEL_COLORS[sa.level] }}
                              />
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
