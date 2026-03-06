import type { TeamMemberProfile, CVFScores } from '@team-manager/shared'
import { Link } from 'react-router-dom'

const QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const
const LABELS: Record<string, string> = { clan: 'Clan', adhocracy: 'Adhocracy', market: 'Market', hierarchy: 'Hierarchy' }

function cellColor(delta: number) {
  const abs = Math.abs(delta)
  if (abs <= 20) return 'text-gray-600'
  if (abs <= 50) return 'bg-amber-50 text-amber-700 font-semibold'
  return 'bg-red-50 text-red-700 font-bold'
}

interface Props {
  members: TeamMemberProfile[]
  companyProfile: CVFScores
  teamId: string
}

export default function TeamCVFComparisonTable({ members, companyProfile, teamId: _ }: Props) {
  const withCVF    = members.filter(m => m.cvf)
  const withoutCVF = members.filter(m => !m.cvf)

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CVF vs Company Profile</h3>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
              {QUADRANTS.map(q => (
                <th key={q} className="text-center px-3 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {LABELS[q]} Δ
                </th>
              ))}
            </tr>
            {/* Company baseline row */}
            <tr className="bg-gray-50 border-b border-gray-200">
              <td className="px-4 py-2 text-xs text-gray-400 italic">Company baseline</td>
              {QUADRANTS.map(q => (
                <td key={q} className="text-center px-3 py-2 text-xs text-gray-500">{companyProfile[q]}</td>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {withCVF.map(({ user, cvf }) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
                {QUADRANTS.map(q => {
                  const delta = cvf!.results[q] - companyProfile[q]
                  return (
                    <td
                      key={q}
                      className={`text-center px-3 py-3 rounded ${cellColor(delta)}`}
                      title={`Member: ${cvf!.results[q]} / Company: ${companyProfile[q]}`}
                    >
                      {delta > 0 ? '+' : ''}{delta}
                    </td>
                  )
                })}
              </tr>
            ))}

            {withoutCVF.map(({ user }) => (
              <tr key={user.id} className="opacity-50">
                <td className="px-4 py-3 text-gray-500">{user.name}</td>
                {QUADRANTS.map(q => (
                  <td key={q} className="text-center px-3 py-3 text-xs text-gray-400 italic">pending</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-400">
        Hover a cell to see raw scores. Red = gap &gt;50pts, amber = 21–50pts, green = within 20pts.
      </p>
    </div>
  )
}
