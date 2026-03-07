import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeProfileReliability } from '@team-manager/core'
import type { TeamMemberProfile, SkillRole } from '@team-manager/shared'
import ReliabilityCoverage from './ReliabilityCoverage.js'


export type SectionType = 'archetype' | 'cvf' | 'skills'

const API = 'http://localhost:3001'

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-100 text-red-700',
  coordinator: 'bg-orange-100 text-orange-700',
  peer:        'bg-blue-100 text-blue-700',
  coach:       'bg-green-100 text-green-700',
  strategist:  'bg-purple-100 text-purple-700',
}

const CVF_COLORS: Record<string, string> = {
  clan:      'bg-green-50 text-green-700',
  adhocracy: 'bg-blue-50 text-blue-700',
  market:    'bg-orange-50 text-orange-700',
  hierarchy: 'bg-gray-100 text-gray-700',
}

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

interface Props {
  member: TeamMemberProfile
  roles: SkillRole[]
  teamSize?: number
  initialSection?: SectionType
  onClose: () => void
}

export default function MemberProfileModal({ member, roles, teamSize = 0, initialSection, onClose }: Props) {
  const { user, leadership, cvf, skills } = member
  const [peerSummary, setPeerSummary] = useState<PeerSkillSummary | null>(null)
  const navigate = useNavigate()

  // Build skill name lookup
  const nameMap = new Map<string, string>()
  for (const r of roles) {
    for (const s of r.skills) {
      if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
    }
  }

  useEffect(() => {
    fetch(`${API}/peer-assessments/skills/${user.id}/summary`)
      .then(r => r.json())
      .then(setPeerSummary)
      .catch(() => {})
  }, [user.id])

  // Compute deltas for skills that have both self + peer data
  const deltas = skills
    .map(sa => {
      const peer = peerSummary?.skills[sa.skillId]
      if (!peer) return null
      const delta = peer.average - sa.level
      return { skillId: sa.skillId, selfLevel: sa.level, peerAvg: peer.average, peerCount: peer.count, delta }
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)

  const blindSpots = deltas.filter(d => d.delta < -0.5).sort((a, b) => a.delta - b.delta)
  const hiddenStrengths = deltas.filter(d => d.delta > 0.5).sort((a, b) => b.delta - a.delta)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Summary view */}
        {true && (
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                  <p className="text-xs text-gray-400">{user.id}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 text-sm"
              >
                ✕
              </button>
            </div>

            {/* Pills row — click navigates to full page */}
            <div className="flex gap-2 flex-wrap">
              {leadership && (
                <button
                  onClick={() => { onClose(); navigate(`/members/${user.id}?section=archetype`) }}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-colors hover:opacity-80 ${ARCHETYPE_COLORS[leadership.archetype] ?? 'bg-gray-100 text-gray-600'}`}
                >
                  {leadership.archetype}
                </button>
              )}
              {cvf && (
                <button
                  onClick={() => { onClose(); navigate(`/members/${user.id}?section=cvf`) }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
                >
                  CVF
                </button>
              )}
              {skills.length > 0 && (
                <button
                  onClick={() => { onClose(); navigate(`/members/${user.id}?section=skills`) }}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors"
                >
                  {skills.length} skills
                </button>
              )}
              {peerSummary && (
                <ReliabilityCoverage
                  reliability={computeProfileReliability(peerSummary.totalEvaluators, teamSize)}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Archetype / Leadership */}
              {leadership && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Leadership</p>
                    <button onClick={() => { onClose(); navigate(`/members/${user.id}?section=archetype`) }} className="text-xs text-blue-500 hover:underline">full view →</button>
                  </div>
                  <div className="space-y-1.5">
                    {Object.entries(leadership.scores).map(([behavior, score]) => (
                      <div key={behavior} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 capitalize w-20 shrink-0">{behavior}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${(score / 20) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8 shrink-0 text-right">{score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CVF */}
              {cvf && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Culture (CVF)</p>
                    <button onClick={() => { onClose(); navigate(`/members/${user.id}?section=cvf`) }} className="text-xs text-purple-500 hover:underline">full view →</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(q => (
                      <div key={q} className={`rounded-lg px-3 py-2 text-center ${CVF_COLORS[q]}`}>
                        <p className="text-xs capitalize opacity-60">{q}</p>
                        <p className="text-base font-bold">{cvf.results[q]}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills overview */}
            {skills.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Skills (self)</p>
                  <button onClick={() => { onClose(); navigate(`/members/${user.id}?section=skills`) }} className="text-xs text-indigo-500 hover:underline">full view →</button>
                </div>
                <div className="space-y-1.5">
                  {skills
                    .slice()
                    .sort((a, b) => b.level - a.level)
                    .slice(0, 5)
                    .map(sa => (
                      <div key={sa.skillId} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-28 shrink-0 truncate">{nameMap.get(sa.skillId) ?? sa.skillId}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${LEVEL_BAR[sa.level]}`} style={{ width: `${(sa.level / 4) * 100}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-6 shrink-0 text-right">{sa.level}</span>
                      </div>
                    ))}
                  {skills.length > 5 && (
                    <button onClick={() => { onClose(); navigate(`/members/${user.id}?section=skills`) }} className="text-xs text-indigo-500 hover:underline">
                      + {skills.length - 5} more skills
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 360° Insights */}
            {peerSummary && peerSummary.totalEvaluators > 0 && (blindSpots.length > 0 || hiddenStrengths.length > 0) && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">360° Insights</p>

                {blindSpots.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-amber-600">⚠ Blind spots — rates higher than peers</p>
                    {blindSpots.slice(0, 3).map(d => (
                      <div key={d.skillId} className="flex items-center justify-between text-xs bg-amber-50 rounded-lg px-3 py-2">
                        <span className="text-gray-700 font-medium">{nameMap.get(d.skillId) ?? d.skillId}</span>
                        <span className="text-gray-500">
                          Me: <span className="font-semibold text-gray-700">{d.selfLevel}</span>
                          {' '}&nbsp;Peers: <span className="font-semibold text-amber-700">{d.peerAvg.toFixed(1)}</span>
                          {' '}&nbsp;<span className="text-amber-600 font-bold">{d.delta.toFixed(1)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {hiddenStrengths.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-blue-600">✨ Hidden strengths — peers rate higher</p>
                    {hiddenStrengths.slice(0, 3).map(d => (
                      <div key={d.skillId} className="flex items-center justify-between text-xs bg-blue-50 rounded-lg px-3 py-2">
                        <span className="text-gray-700 font-medium">{nameMap.get(d.skillId) ?? d.skillId}</span>
                        <span className="text-gray-500">
                          Me: <span className="font-semibold text-gray-700">{d.selfLevel}</span>
                          {' '}&nbsp;Peers: <span className="font-semibold text-blue-700">{d.peerAvg.toFixed(1)}</span>
                          {' '}&nbsp;<span className="text-blue-600 font-bold">+{d.delta.toFixed(1)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {peerSummary && peerSummary.totalEvaluators === 0 && (
              <p className="text-xs text-gray-400 italic">No peer evaluations yet for this person.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
