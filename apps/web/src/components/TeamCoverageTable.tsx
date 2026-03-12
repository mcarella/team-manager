import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeProfileReliability } from '@team-manager/core'
import type { TeamMemberProfile } from '@team-manager/shared'
import { API_BASE } from '../lib/api.js'

interface PeerSummary {
  totalEvaluators: number
}

interface CoverageRow {
  member: TeamMemberProfile
  skillEvaluators: number | null
  leadershipEvaluators: number | null
  cvfEvaluators: number | null
}

interface Props {
  members: TeamMemberProfile[]
}

function coverageColor(pct: number): string {
  if (pct <= 10)  return 'bg-red-500'
  if (pct < 50)   return 'bg-orange-400'
  if (pct < 80)   return 'bg-yellow-400'
  return 'bg-green-500'
}

function CoverageBar({ evaluators, teamSize }: { evaluators: number | null; teamSize: number }) {
  if (evaluators === null) return <span className="text-xs text-gray-300">…</span>
  const reliability = computeProfileReliability(evaluators, teamSize)
  const pct = Math.round(reliability.coverage * 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-10 shrink-0">
        {reliability.evaluators}/{reliability.peers}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${coverageColor(pct)}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 w-8 shrink-0">{pct}%</span>
    </div>
  )
}

export default function TeamCoverageTable({ members }: Props) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<CoverageRow[]>(
    members.map(m => ({ member: m, skillEvaluators: null, leadershipEvaluators: null, cvfEvaluators: null }))
  )

  const teamSize = members.length

  useEffect(() => {
    setRows(members.map(m => ({ member: m, skillEvaluators: null, leadershipEvaluators: null, cvfEvaluators: null })))
    members.forEach(m => {
      const id = m.user.id

      fetch(`${API_BASE}/peer-assessments/skills/${id}/summary`)
        .then(r => r.json())
        .then((data: PeerSummary) => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, skillEvaluators: data.totalEvaluators } : row
        )))
        .catch(() => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, skillEvaluators: 0 } : row
        )))

      fetch(`${API_BASE}/peer-assessments/leadership/${id}/summary`)
        .then(r => r.json())
        .then((data: PeerSummary) => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, leadershipEvaluators: data.totalEvaluators } : row
        )))
        .catch(() => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, leadershipEvaluators: 0 } : row
        )))

      fetch(`${API_BASE}/peer-assessments/cvf/${id}/summary`)
        .then(r => r.json())
        .then((data: PeerSummary) => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, cvfEvaluators: data.totalEvaluators } : row
        )))
        .catch(() => setRows(prev => prev.map(row =>
          row.member.user.id === id ? { ...row, cvfEvaluators: 0 } : row
        )))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.map(m => m.user.id).join(',')])

  // Sort by skill coverage ascending (least covered first)
  const sorted = [...rows].sort((a, b) => {
    if (a.skillEvaluators === null) return 1
    if (b.skillEvaluators === null) return -1
    return computeProfileReliability(a.skillEvaluators, teamSize).coverage
         - computeProfileReliability(b.skillEvaluators, teamSize).coverage
  })

  const avg = (field: 'skillEvaluators' | 'leadershipEvaluators' | 'cvfEvaluators') => {
    const loaded = rows.filter(r => r[field] !== null)
    if (loaded.length === 0) return 0
    return loaded.reduce((sum, r) =>
      sum + computeProfileReliability(r[field]!, teamSize).coverage, 0
    ) / loaded.length
  }
  const avgSkill      = avg('skillEvaluators')
  const avgLeadership = avg('leadershipEvaluators')
  const avgCulture    = avg('cvfEvaluators')

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className={`text-xl font-bold ${avgSkill >= 0.8 ? 'text-green-600' : avgSkill >= 0.5 ? 'text-yellow-500' : avgSkill > 0.1 ? 'text-orange-500' : 'text-red-500'}`}>
            {Math.round(avgSkill * 100)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Avg skill coverage</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className={`text-xl font-bold ${avgLeadership >= 0.8 ? 'text-green-600' : avgLeadership >= 0.5 ? 'text-yellow-500' : avgLeadership > 0.1 ? 'text-orange-500' : 'text-red-500'}`}>
            {Math.round(avgLeadership * 100)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Avg leadership coverage</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
          <p className={`text-xl font-bold ${avgCulture >= 0.8 ? 'text-green-600' : avgCulture >= 0.5 ? 'text-yellow-500' : avgCulture > 0.1 ? 'text-orange-500' : 'text-red-500'}`}>
            {Math.round(avgCulture * 100)}%
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Avg culture coverage</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Skills</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Leadership</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Culture</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ member, skillEvaluators, leadershipEvaluators, cvfEvaluators }) => (
              <tr
                key={member.user.id}
                onClick={() => navigate(`/members/${member.user.id}?section=skills`)}
                className="border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{member.user.name}</span>
                    {member.user.role === 'manager' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700">Mgr</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <CoverageBar evaluators={skillEvaluators} teamSize={teamSize} />
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <CoverageBar evaluators={leadershipEvaluators} teamSize={teamSize} />
                </td>
                <td className="px-4 py-3 min-w-[140px]">
                  <CoverageBar evaluators={cvfEvaluators} teamSize={teamSize} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
