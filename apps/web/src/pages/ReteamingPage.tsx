import { useState, useMemo, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip } from 'recharts'
import { computeKiviatData } from '@team-manager/core'
import type { TeamMemberProfile, CVFScores, Archetype, SkillRole } from '@team-manager/shared'
import { useStore } from '../store/index.js'

const QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const
const LABELS: Record<string, string> = { clan: 'Clan', adhocracy: 'Adhocracy', market: 'Market', hierarchy: 'Hierarchy' }

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700 border-red-200',
  coordinator: 'bg-orange-100 text-orange-700 border-orange-200',
  peer:        'bg-blue-100 text-blue-700 border-blue-200',
  coach:       'bg-green-100 text-green-700 border-green-200',
  strategist:  'bg-purple-100 text-purple-700 border-purple-200',
}

type TeamAssignments = Record<string, string[]>

function buildAssignments(teams: { id: string; members: TeamMemberProfile[] }[]): TeamAssignments {
  const a: TeamAssignments = {}
  for (const t of teams) a[t.id] = t.members.map(m => m.user.id)
  return a
}

function getMembersForTeam(
  assignments: TeamAssignments,
  teamId: string,
  allMembers: Map<string, TeamMemberProfile>,
): TeamMemberProfile[] {
  return (assignments[teamId] ?? [])
    .map(id => allMembers.get(id))
    .filter((m): m is TeamMemberProfile => !!m)
}

function countMoves(original: TeamAssignments, current: TeamAssignments): number {
  let moves = 0
  for (const [teamId, memberIds] of Object.entries(current)) {
    const orig = new Set(original[teamId] ?? [])
    for (const id of memberIds) {
      if (!orig.has(id)) moves++
    }
  }
  return moves
}

function cvfDelta(a: CVFScores, b: CVFScores): Record<string, number> {
  const d: Record<string, number> = {}
  for (const q of QUADRANTS) d[q] = Math.round(a[q] - b[q])
  return d
}

function skillAvgMap(members: TeamMemberProfile[]): Map<string, number> {
  const buckets = new Map<string, number[]>()
  for (const m of members) {
    for (const sa of m.skills) {
      if (!buckets.has(sa.skillId)) buckets.set(sa.skillId, [])
      buckets.get(sa.skillId)!.push(sa.level)
    }
  }
  const result = new Map<string, number>()
  for (const [id, levels] of buckets) {
    result.set(id, levels.reduce((s, l) => s + l, 0) / levels.length)
  }
  return result
}

function TopSkills({ members, prevMembers, roles }: { members: TeamMemberProfile[]; prevMembers?: TeamMemberProfile[]; roles: SkillRole[] }) {
  const nameMap = new Map<string, string>()
  for (const r of roles) for (const s of r.skills) if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)

  const current = skillAvgMap(members)
  const prev = prevMembers ? skillAvgMap(prevMembers) : null

  // All skill IDs from both current and previous
  const allIds = new Set([...current.keys(), ...(prev ? prev.keys() : [])])

  const all = [...allIds].map(id => ({
    id,
    avg: current.get(id) ?? 0,
    prevAvg: prev?.get(id) ?? 0,
    delta: prev ? (current.get(id) ?? 0) - (prev.get(id) ?? 0) : 0,
  }))

  // Current top skills (highest avg)
  const top = all.filter(s => s.avg > 0).sort((a, b) => b.avg - a.avg).slice(0, 4)
  // Lost skills (existed before, gone now)
  const lost = prev ? all.filter(s => s.avg === 0 && s.prevAvg > 0).sort((a, b) => b.prevAvg - a.prevAvg) : []
  // Decreased skills not already in top (still present but dropped)
  const topIds = new Set(top.map(s => s.id))
  const decreased = prev ? all.filter(s => s.avg > 0 && s.delta < -0.05 && !topIds.has(s.id)).sort((a, b) => a.delta - b.delta).slice(0, 4) : []

  if (top.length === 0 && lost.length === 0) return null

  return (
    <div className="space-y-1.5">
      {/* Top skills */}
      <div className="flex flex-wrap gap-1">
        {top.map(s => {
          const d = Math.round(s.delta * 10) / 10
          return (
            <span key={s.id} className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-600 font-medium flex items-center gap-1">
              {nameMap.get(s.id) ?? s.id}
              <span className="w-4 h-4 rounded-full bg-white/60 text-[9px] font-bold flex items-center justify-center">{s.avg.toFixed(1)}</span>
              {d !== 0 && (
                <span className={d > 0 ? 'text-green-600' : 'text-red-500'}>
                  {d > 0 ? '↑' : '↓'}{Math.abs(d).toFixed(1)}
                </span>
              )}
            </span>
          )
        })}
      </div>
      {/* Decreased skills */}
      {decreased.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {decreased.map(s => {
            const d = Math.round(s.delta * 10) / 10
            return (
              <span key={s.id} className="px-1.5 py-0.5 rounded text-[10px] bg-amber-50 text-amber-700 font-medium flex items-center gap-1">
                {nameMap.get(s.id) ?? s.id}
                <span className="w-4 h-4 rounded-full bg-white/60 text-[9px] font-bold flex items-center justify-center">{s.avg.toFixed(1)}</span>
                <span className="text-red-500">↓{Math.abs(d).toFixed(1)}</span>
              </span>
            )
          })}
        </div>
      )}
      {/* Lost skills */}
      {lost.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {lost.map(s => (
            <span key={s.id} className="px-1.5 py-0.5 rounded text-[10px] bg-red-50 text-red-500 font-medium flex items-center gap-1 line-through">
              {nameMap.get(s.id) ?? s.id}
              <span className="no-underline text-[9px]">was {s.prevAvg.toFixed(1)}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function MiniRadar({ scores, prevScores }: { scores: CVFScores; prevScores?: CVFScores }) {
  const data = QUADRANTS.map(q => ({
    q: LABELS[q],
    now: Math.round(scores[q]),
    ...(prevScores ? { before: Math.round(prevScores[q]) } : {}),
  }))

  return (
    <RadarChart width={180} height={160} data={data} outerRadius={55} cx={90} cy={85}>
      <PolarGrid />
      <PolarAngleAxis dataKey="q" tick={{ fontSize: 9 }} />
      {prevScores && (
        <Radar dataKey="before" stroke="#d1d5db" fill="#d1d5db" fillOpacity={0.15} />
      )}
      <Radar dataKey="now" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.3} />
      <Tooltip formatter={(v) => [`${v}`, '']} />
    </RadarChart>
  )
}

function Section({ title, defaultOpen = true, children }: { title: string; defaultOpen?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={e => { e.stopPropagation(); setOpen(o => !o) }}
        className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide hover:bg-gray-50/50"
      >
        {title}
        <span className="text-gray-300 text-xs">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="px-3 pb-2">{children}</div>}
    </div>
  )
}

function archetypeDelta(
  current: TeamMemberProfile[],
  original: TeamMemberProfile[],
): Record<string, number> {
  const count = (members: TeamMemberProfile[]) => {
    const c: Record<string, number> = {}
    for (const a of ['expert', 'coordinator', 'peer', 'coach', 'strategist']) c[a] = 0
    for (const m of members) if (m.leadership) c[m.leadership.archetype] = (c[m.leadership.archetype] ?? 0) + 1
    return c
  }
  const cur = count(current)
  const orig = count(original)
  const d: Record<string, number> = {}
  for (const a of Object.keys(cur)) d[a] = cur[a]! - orig[a]!
  return d
}

export default function ReteamingPage() {
  const { teams, roles, currentRole, currentUserId, managerTeamIds } = useStore()
  const backPath = currentRole === 'company' ? '/company' : currentRole === 'manager' ? '/manager' : '/'
  const myTeamIds = new Set(currentRole === 'manager' ? (managerTeamIds[currentUserId ?? ''] ?? []) : [])

  // --- Team selection phase ---
  const [pickedIds, setPickedIds] = useState<Set<string> | null>(null)
  const [pickDraft, setPickDraft] = useState<Set<string>>(() => new Set(teams.map(t => t.id)))

  const activeTeams = useMemo(
    () => pickedIds ? teams.filter(t => pickedIds.has(t.id)) : [],
    [teams, pickedIds],
  )

  const allMembers = useMemo(() => {
    const map = new Map<string, TeamMemberProfile>()
    for (const t of activeTeams) for (const m of t.members) map.set(m.user.id, m)
    return map
  }, [activeTeams])

  const original = useMemo(() => buildAssignments(activeTeams), [activeTeams])
  const [assignments, setAssignments] = useState<TeamAssignments>({})
  const [selectedMember, setSelectedMember] = useState<string | null>(null)
  const [dragOverTeam, setDragOverTeam] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)

  const originalKiviat = useMemo(() => {
    const map: Record<string, ReturnType<typeof computeKiviatData>> = {}
    for (const t of activeTeams) map[t.id] = computeKiviatData(t.members)
    return map
  }, [activeTeams])

  const moves = countMoves(original, assignments)

  const startReteaming = () => {
    if (pickDraft.size < 2) return
    setPickedIds(pickDraft)
    const filtered = teams.filter(t => pickDraft.has(t.id))
    setAssignments(buildAssignments(filtered))
    setApplied(false)
    setSelectedMember(null)
  }

  const goBackToSelection = () => {
    setPickedIds(null)
    setAssignments({})
    setSelectedMember(null)
    setApplied(false)
  }

  // --- Move logic (shared by click and drag) ---

  const moveMember = (memberId: string, targetTeamId: string) => {
    setAssignments(prev => {
      const next = { ...prev }
      for (const [tid, mids] of Object.entries(next)) {
        if (mids.includes(memberId)) {
          next[tid] = mids.filter(id => id !== memberId)
        }
      }
      next[targetTeamId] = [...(next[targetTeamId] ?? []), memberId]
      return next
    })
    setSelectedMember(null)
    setApplied(false)
  }

  // --- Click handlers ---

  const handleSelectMember = (memberId: string) => {
    setSelectedMember(prev => prev === memberId ? null : memberId)
    setApplied(false)
  }

  const handleClickTeam = (targetTeamId: string) => {
    if (!selectedMember) return
    const currentIds = new Set(assignments[targetTeamId] ?? [])
    if (currentIds.has(selectedMember)) return
    moveMember(selectedMember, targetTeamId)
  }

  // --- Drag handlers ---

  const handleDragStart = (e: React.DragEvent, memberId: string) => {
    e.dataTransfer.setData('text/plain', memberId)
    e.dataTransfer.effectAllowed = 'move'
    setSelectedMember(null)
  }

  const handleDragOver = (e: React.DragEvent, teamId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverTeam(teamId)
  }

  const handleDragLeave = () => {
    setDragOverTeam(null)
  }

  const handleDrop = (e: React.DragEvent, teamId: string) => {
    e.preventDefault()
    setDragOverTeam(null)
    const memberId = e.dataTransfer.getData('text/plain')
    if (!memberId) return
    const currentIds = new Set(assignments[teamId] ?? [])
    if (currentIds.has(memberId)) return
    moveMember(memberId, teamId)
  }

  // --- Reset / Apply ---

  const handleReset = () => {
    setAssignments(buildAssignments(activeTeams))
    setSelectedMember(null)
    setApplied(false)
  }

  const handleApply = () => {
    const newTeams = teams.map(t => {
      if (!pickedIds?.has(t.id)) return t
      return { ...t, members: getMembersForTeam(assignments, t.id, allMembers) }
    })
    useStore.setState({ teams: newTeams })
    setApplied(true)
  }

  // --- Team selection screen ---
  if (!pickedIds) {
    return (
      <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
        <div className="w-full max-w-lg">
          <h1 className="text-3xl font-bold">Reteaming</h1>
          <p className="text-gray-500 mt-1">
            Select which teams to include in the reteaming exercise.
          </p>
        </div>

        <div className="w-full max-w-lg space-y-2">
          {teams.map(team => {
            const checked = pickDraft.has(team.id)
            return (
              <label
                key={team.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'border-teal-300 bg-teal-50/50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    setPickDraft(prev => {
                      const next = new Set(prev)
                      if (next.has(team.id)) next.delete(team.id)
                      else next.add(team.id)
                      return next
                    })
                  }}
                  className="accent-teal-600 w-4 h-4"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{team.name}</p>
                    {myTeamIds.has(team.id) && (
                      <span className="px-1.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-700">Your team</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{team.members.length} member{team.members.length !== 1 ? 's' : ''}</p>
                </div>
              </label>
            )
          })}
        </div>

        <div className="w-full max-w-lg flex items-center justify-between">
          <Link to={backPath} className="text-blue-600 hover:underline text-sm">← Back</Link>
          <button
            onClick={startReteaming}
            disabled={pickDraft.size < 2}
            className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-40"
          >
            Start reteaming ({pickDraft.size} teams)
          </button>
        </div>
      </main>
    )
  }

  // --- Reteaming sandbox ---
  return (
    <main className="min-h-screen flex flex-col items-center py-8 px-4 gap-6">
      <div className="w-full max-w-7xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reteaming</h1>
          <p className="text-gray-500 mt-1">
            Move people between teams and see how culture, leadership and skills change in real-time.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {moves > 0 && (
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
              {moves} move{moves !== 1 ? 's' : ''}
            </span>
          )}
          <button
            onClick={handleReset}
            disabled={moves === 0}
            className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Reset
          </button>
          <button
            onClick={handleApply}
            disabled={moves === 0}
            className="px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-40"
          >
            Apply changes
          </button>
          <button
            onClick={goBackToSelection}
            className="text-sm text-gray-400 hover:text-gray-600"
          >
            Change teams
          </button>
          <Link to={backPath} className="text-blue-600 hover:underline text-sm">← Back</Link>
        </div>
      </div>

      {applied && (
        <div className="w-full max-w-7xl bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 font-medium">
          Changes applied! Team compositions have been updated.
        </div>
      )}

      {selectedMember && (
        <div className="w-full max-w-7xl bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-700">
            <strong>{allMembers.get(selectedMember)?.user.name}</strong> selected — click a team or drag to move
          </p>
          <button
            onClick={() => setSelectedMember(null)}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Team columns */}
      <div className="w-full max-w-7xl grid gap-4" style={{ gridTemplateColumns: `repeat(${activeTeams.length}, minmax(0, 1fr))` }}>
        {activeTeams.map(team => {
          const currentMembers = getMembersForTeam(assignments, team.id, allMembers)
          const kiviat = computeKiviatData(currentMembers)
          const origKiviat = originalKiviat[team.id]
          const delta = origKiviat ? cvfDelta(kiviat.cvfAverage, origKiviat.cvfAverage) : null

          const origIds = new Set(original[team.id] ?? [])
          const currentIds = new Set(assignments[team.id] ?? [])
          const added = [...currentIds].filter(id => !origIds.has(id))
          const removed = [...origIds].filter(id => !currentIds.has(id))
          const hasChanges = added.length > 0 || removed.length > 0
          const isDragTarget = dragOverTeam === team.id
          const isClickTarget = selectedMember && !currentIds.has(selectedMember)

          return (
            <div
              key={team.id}
              className={`flex flex-col rounded-2xl border-2 shadow-sm overflow-hidden transition-colors ${
                isDragTarget
                  ? 'border-blue-400 bg-blue-50/40 scale-[1.01]'
                  : isClickTarget
                    ? 'border-blue-300 bg-blue-50/30 cursor-pointer'
                    : hasChanges
                      ? 'border-amber-300 bg-amber-50/20'
                      : 'border-gray-100 bg-white'
              }`}
              onClick={() => handleClickTeam(team.id)}
              onDragOver={e => handleDragOver(e, team.id)}
              onDragLeave={handleDragLeave}
              onDrop={e => handleDrop(e, team.id)}
            >
              {/* Team header */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">{team.name}</h3>
                  <span className="w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600 flex items-center justify-center">{currentMembers.length}</span>
                </div>
                {hasChanges && (
                  <div className="flex gap-2 mt-1">
                    {added.length > 0 && (
                      <span className="text-[10px] text-green-600 font-medium">+{added.length} in</span>
                    )}
                    {removed.length > 0 && (
                      <span className="text-[10px] text-red-500 font-medium">-{removed.length} out</span>
                    )}
                  </div>
                )}
              </div>

              {/* Warnings */}
              {(() => {
                const warnings: { key: string; label: string; color: string }[] = []
                if (currentMembers.length > 10) {
                  warnings.push({ key: 'synergy', label: 'Synergy warning — team exceeds 10 members', color: 'bg-orange-50 text-orange-700 border-orange-200' })
                }
                const origSize = origIds.size
                if (origSize > 0 && removed.length / origSize > 0.35) {
                  warnings.push({ key: 'disruption', label: 'Culture disruption → >35% members removed', color: 'bg-red-50 text-red-700 border-red-200' })
                }
                return warnings.length > 0 ? (
                  <div className="px-3 py-2 space-y-1">
                    {warnings.map(w => (
                      <div key={w.key} className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium ${w.color}`}>
                        ⚠ {w.label}
                      </div>
                    ))}
                  </div>
                ) : null
              })()}

              {/* Section 1: CVF */}
              <Section title="Culture (CVF)">
                <div className="flex justify-center">
                  <MiniRadar
                    scores={kiviat.cvfAverage}
                    {...(hasChanges && origKiviat ? { prevScores: origKiviat.cvfAverage } : {})}
                  />
                </div>
                {delta && hasChanges && (
                  <div className="flex justify-center gap-1 pt-1">
                    {QUADRANTS.map(q => {
                      const d = delta[q]!
                      if (d === 0) return null
                      return (
                        <span
                          key={q}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            d > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}
                        >
                          {LABELS[q]?.slice(0, 3)} {d > 0 ? '+' : ''}{d}
                        </span>
                      )
                    })}
                  </div>
                )}
              </Section>

              {/* Section 2: Skills */}
              <Section title="Skills">
                <TopSkills members={currentMembers} {...(hasChanges ? { prevMembers: team.members } : {})} roles={roles} />
              </Section>

              {/* Section 3: Archetypes */}
              <Section title="Archetypes">
                {(() => {
                  const archDelta = hasChanges ? archetypeDelta(currentMembers, team.members) : null
                  return (
                    <div className="flex gap-1 flex-wrap">
                      {(['expert', 'coordinator', 'peer', 'coach', 'strategist'] as Archetype[]).map(a => {
                        const count = currentMembers.filter(m => m.leadership?.archetype === a).length
                        const d = archDelta ? archDelta[a]! : 0
                        if (count === 0 && d === 0) return null
                        return (
                          <span key={a} className={`px-1.5 py-0.5 rounded text-[10px] font-medium capitalize flex items-center gap-1 ${ARCHETYPE_COLORS[a]}`}>
                            {a}
                            <span className="w-4 h-4 rounded-full bg-white/60 text-[9px] font-bold flex items-center justify-center">{count}</span>
                            {d !== 0 && (
                              <span className={`text-[9px] font-bold ${d > 0 ? 'text-green-700' : 'text-red-600'}`}>
                                {d > 0 ? '+' : ''}{d}
                              </span>
                            )}
                          </span>
                        )
                      })}
                    </div>
                  )
                })()}
              </Section>

              {/* Section 4: Members */}
              <Section title="Members">
                <div className="space-y-1.5">
                  {currentMembers.map(member => {
                    const isNew = !origIds.has(member.user.id)
                    const isSelected = selectedMember === member.user.id
                    return (
                      <div
                        key={member.user.id}
                        draggable
                        onDragStart={e => handleDragStart(e, member.user.id)}
                        onClick={e => { e.stopPropagation(); handleSelectMember(member.user.id) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-grab active:cursor-grabbing ${
                          isSelected
                            ? 'bg-blue-100 border-2 border-blue-400'
                            : isNew
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-100 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0">
                          {member.user.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-800 truncate">{member.user.name}</p>
                        </div>
                        {member.leadership && (
                          <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                            ARCHETYPE_COLORS[member.leadership.archetype] ?? 'bg-gray-100 text-gray-600'
                          }`}>
                            {member.leadership.archetype}
                          </span>
                        )}
                        {isNew && (
                          <span className="text-[10px] text-green-600 font-bold">NEW</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Section>
            </div>
          )
        })}
      </div>
    </main>
  )
}
