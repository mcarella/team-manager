import { Link } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
import { useStore } from '../store/index.js'
import ArchetypeChart from '../components/ArchetypeChart.js'
import CVFRadarChart from '../components/CVFRadarChart.js'
import SkillsChart from '../components/SkillsChart.js'
import MemberList from '../components/MemberList.js'

export default function TeamDashboardPage() {
  const { members, skills } = useStore()
  const kiviat = computeKiviatData(members)

  const hasAnyData = members.length > 0

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Dashboard</h1>
          <p className="text-gray-500 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/" className="text-blue-600 hover:underline text-sm">← Back</Link>
      </div>

      {!hasAnyData ? (
        <div className="text-center space-y-4 py-16">
          <p className="text-gray-400 text-lg">No data yet.</p>
          <p className="text-gray-400 text-sm">Complete leadership or CVF assessments to see team analytics.</p>
          <div className="flex gap-3 justify-center">
            <Link to="/assessment/leadership" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Leadership Assessment
            </Link>
            <Link to="/assessment/cvf" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
              CVF Assessment
            </Link>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-6">
          {/* Charts row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <ArchetypeChart distribution={kiviat.archetypeDistribution} />
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <CVFRadarChart scores={kiviat.cvfAverage} />
            </div>
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <SkillsChart skillsAverage={kiviat.skillsAverage} skills={skills} />
            </div>
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Members</h3>
            <MemberList members={members} />
          </div>

          {/* Add assessment links */}
          <div className="flex gap-3 justify-center pt-2">
            <Link to="/assessment/leadership" className="px-4 py-2 border border-blue-200 text-blue-600 rounded-lg text-sm hover:bg-blue-50">
              + Leadership Assessment
            </Link>
            <Link to="/assessment/cvf" className="px-4 py-2 border border-purple-200 text-purple-600 rounded-lg text-sm hover:bg-purple-50">
              + CVF Assessment
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
