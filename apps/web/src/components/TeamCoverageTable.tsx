import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeProfileReliability } from '@team-manager/core'
import type { TeamMemberProfile } from '@team-manager/shared'
import ReliabilityCoverage from './ReliabilityCoverage.js'

const API = 'http://localhost:3001'

interface SkillSummary {
  subjectId: string
  totalEvaluators: number
}

interface CoverageRow {
  member: TeamMemberProfile
  skillEvaluators: number | null // null = loading
}

interface Props {
  members: TeamMemberProfile[]
}

export default function TeamCoverageTable({ members }: Props) {
  const navigate = useNavigate()
  const [rows, setRows] = useState<CoverageRow[]>(
    members.map(m => ({ member: m, skillEvaluators: null }))
  )

  const teamSize = members.length

  useEffect(() => {
    setRows(members.map(m => ({ member: m, skillEvaluators: null })))
    members.forEach(m => {
      fetch(`${API}/peer-assessments/skills/${m.user.id}/summary`)
        .then(r => r.json())
        .then((data: SkillSummary) => {
          setRows(prev =>
            prev.map(row =>
              row.member.user.id === m.user.id
                ? { ...row, skillEvaluators: data.totalEvaluators }
                : row
            )
          )
        })
        .catch(() => {
          setRows(prev =>
            prev.map(row =>
              row.member.user.id === m.user.id
                ? { ...row, skillEvaluators: 0 }
                : row
            )
          )
        })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [members.map(m => m.user.id).join(',')])

  // Sort: loading last, then by coverage ascending (least evaluated first)
  const sorted = [...rows].sort((a, b) => {
    if (a.skillEvaluators === null) return 1
    if (b.skillEvaluators === null) return -1
    const ca = computeProfileReliability(a.skillEvaluators, teamSize).coverage
    const cb = computeProfileReliability(b.skillEvaluators, teamSize).coverage
    return ca - cb
  })

  const loaded = rows.filter(r => r.skillEvaluators !== null)
  const reliable = loaded.filter(r =>
    computeProfileReliability(r.skillEvaluators!, teamSize).status === 'reliable'
  ).length
  const noData = loaded.filter(r => r.skillEvaluators === 0).length
  const avgCoverage = loaded.length === 0 ? 0
    : loaded.reduce((sum, r) =>
        sum + computeProfileReliability(r.skillEvaluators!, teamSize).coverage, 0
      ) / loaded.length

  return (
    <div className="space-y-4">
      {/* Team summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold text-gray-800">{Math.round(avgCoverage * 100)}%</p>
          <p className="text-xs text-gray-400 mt-0.5">Avg coverage</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold text-green-600">{reliable}</p>
          <p className="text-xs text-gray-400 mt-0.5">Reliable profiles</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
          <p className="text-xl font-bold text-red-500">{noData}</p>
          <p className="text-xs text-gray-400 mt-0.5">No peer data</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Skill coverage</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ member, skillEvaluators }) => {
              const reliability = skillEvaluators !== null
                ? computeProfileReliability(skillEvaluators, teamSize)
                : null
              const isZero = skillEvaluators === 0

              return (
                <tr
                  key={member.user.id}
                  onClick={() => navigate(`/members/${member.user.id}?section=skills`)}
                  className={`border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                    isZero ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-gray-50'
                  }`}
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
                  <td className="px-4 py-3">
                    {reliability === null ? (
                      <span className="text-xs text-gray-300">Loading…</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-12 shrink-0">
                          {reliability.evaluators}/{reliability.peers}
                        </span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              reliability.status === 'reliable' ? 'bg-green-500' :
                              reliability.status === 'partial' ? 'bg-amber-400' : 'bg-gray-300'
                            }`}
                            style={{ width: `${Math.round(reliability.coverage * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-400 w-8 shrink-0">
                          {Math.round(reliability.coverage * 100)}%
                        </span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {reliability && <ReliabilityCoverage reliability={reliability} />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
