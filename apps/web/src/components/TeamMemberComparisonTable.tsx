import { useState } from 'react'
import type { TeamMemberProfile, SkillRole } from '@team-manager/shared'
import { ARCHETYPE_COLORS } from '../lib/archetype-colors.js'

const LEVEL_BAR: Record<number, string> = {
  0: 'bg-gray-300', 1: 'bg-blue-400', 2: 'bg-green-500', 3: 'bg-purple-500', 4: 'bg-amber-400',
}

interface Props {
  members: TeamMemberProfile[]
  roles: SkillRole[]
}

export default function TeamMemberComparisonTable({ members, roles }: Props) {
  const [sortByArchetype, setSortByArchetype] = useState(false)

  // Deduplicated skill list
  const skills = roles
    .flatMap(r => r.skills)
    .filter((s, i, arr) => arr.findIndex(x => x.id === s.id) === i)

  // Detect skill gaps: no member rated above level 1
  const gapSkillIds = new Set(
    skills
      .filter(skill =>
        members.every(m => {
          const sa = m.skills.find(s => s.skillId === skill.id)
          return !sa || sa.level <= 1
        })
      )
      .map(s => s.id)
  )

  const sorted = sortByArchetype
    ? [...members].sort((a, b) => {
        const aa = a.leadership?.archetype ?? 'zzz'
        const bb = b.leadership?.archetype ?? 'zzz'
        return aa.localeCompare(bb)
      })
    : members

  if (members.length === 0) return null

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap sticky left-0 bg-gray-50 z-10 min-w-36">
                Member
              </th>
              <th className="px-3 py-3 text-center">
                <button
                  onClick={() => setSortByArchetype(v => !v)}
                  className={`text-xs font-semibold uppercase tracking-wide whitespace-nowrap transition-colors ${
                    sortByArchetype ? 'text-orange-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Archetype {sortByArchetype ? '↑' : '↕'}
                </button>
              </th>
              {skills.map(skill => (
                <th
                  key={skill.id}
                  className={`px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide whitespace-nowrap ${
                    gapSkillIds.has(skill.id) ? 'text-amber-600 bg-amber-50' : 'text-gray-400'
                  }`}
                  title={gapSkillIds.has(skill.id) ? 'Team-wide skill gap — no one above level 1' : undefined}
                >
                  {skill.name}
                  {gapSkillIds.has(skill.id) && <span className="ml-1">⚠</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(member => {
              const { user, leadership, skills: memberSkills } = member
              return (
                <tr key={user.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                  {/* Name */}
                  <td className="px-4 py-3 sticky left-0 bg-white hover:bg-gray-50 z-10">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-800 whitespace-nowrap text-xs">{user.name}</span>
                    </div>
                  </td>

                  {/* Archetype */}
                  <td className="px-3 py-3 text-center">
                    {leadership ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ARCHETYPE_COLORS[leadership.archetype] ?? 'bg-gray-100 text-gray-600'}`}>
                        {leadership.archetype}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Pending</span>
                    )}
                  </td>

                  {/* Skills */}
                  {skills.map(skill => {
                    const sa = memberSkills.find(s => s.skillId === skill.id)
                    const level = sa?.level ?? 0
                    return (
                      <td key={skill.id} className={`px-3 py-3 ${gapSkillIds.has(skill.id) ? 'bg-amber-50/40' : ''}`}>
                        <div className="flex flex-col items-center gap-1 min-w-12">
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${LEVEL_BAR[level]}`}
                              style={{ width: `${(level / 4) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-400">{level}</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {gapSkillIds.size > 0 && (
        <p className="text-xs text-amber-600">
          ⚠ {gapSkillIds.size} skill{gapSkillIds.size !== 1 ? 's' : ''} flagged as team-wide gap — no member rated above level 1.
        </p>
      )}
    </div>
  )
}
