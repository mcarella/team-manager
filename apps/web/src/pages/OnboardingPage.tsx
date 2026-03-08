import { Link, useNavigate } from 'react-router-dom'
// import type { MemberFile } from '@team-manager/shared'
import { useStore } from '../store/index.js'

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { currentUserId, currentRole, members, teams, managerTeamIds, memberTeamId } = useStore()

  if (!currentUserId || currentRole !== 'member') {
    navigate('/', { replace: true })
    return null
  }

  const member = members.find(m => m.user.id === currentUserId)

  // Team lookup via direct map (same pattern as managerTeamIds)
  const myTeam = teams.find(t => t.id === memberTeamId[currentUserId]) ?? null
  const myTeams = myTeam ? [myTeam] : []
  const myManagerIds = new Set(
    myTeams.flatMap(t =>
      Object.entries(managerTeamIds)
        .filter(([, tids]) => tids.includes(t.id))
        .map(([mid]) => mid)
    )
  )
  const myManager = members.find(m => myManagerIds.has(m.user.id))
  const hasLeadership = Boolean(member?.leadership)
  const hasCVF = Boolean(member?.cvf)
  const hasSkills = (member?.skills.length ?? 0) > 0
  const completedCount = [hasLeadership, hasCVF, hasSkills].filter(Boolean).length

  const STEPS = [
    { key: 'leadership', label: 'Leadership', path: '/assessment/leadership', color: 'bg-blue-600', desc: 'Archetype · rate others · 360° feedback', done: hasLeadership },
    { key: 'cvf',        label: 'Culture', path: '/assessment/cvf',    color: 'bg-purple-600', desc: 'Your culture profile · org culture',       done: hasCVF },
    { key: 'skills',     label: 'Skills',     path: '/assessment/skills',    color: 'bg-green-600', desc: 'Rate skills · rate others · 360° feedback', done: hasSkills },
  ]

  // const handleExport = () => {
  //   if (!member) return
  //   const file: MemberFile = {
  //     version: '1',
  //     exportedAt: new Date().toISOString(),
  //     user: member.user,
  //     leadership: member.leadership ?? null,
  //     cvf: member.cvf ?? null,
  //     skills: member.skills,
  //   }
  //   const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement('a')
  //   a.href = url
  //   a.download = `${currentUserId}.member`
  //   a.click()
  //   URL.revokeObjectURL(url)
  // }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <p className="text-sm text-gray-400">Logged in as</p>
        <h1 className="text-3xl font-bold">{currentUserId}</h1>
        {myTeams.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {myTeams.map(t => (
              <span key={t.id} className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600">{t.name}</span>
            ))}
          </div>
        )}
        <p className="text-gray-500 mt-1">{completedCount}/3 self-assessments completed</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md">
        <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
          <div
            className="bg-blue-600 h-2 transition-all duration-500"
            style={{ width: `${(completedCount / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Self-assessment steps */}
      <div className="w-full max-w-md space-y-3">
        {STEPS.map((step, i) => (
          <Link
            key={step.key}
            to={step.path}
            className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-all ${
              step.done
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 ${
              step.done ? 'bg-green-500' : step.color
            }`}>
              {step.done ? '✓' : i + 1}
            </span>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${step.done ? 'text-green-700' : 'text-gray-800'}`}>
                {step.label}
              </p>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </div>
            <span className="text-gray-400 text-sm">{step.done ? 'Redo' : 'Start'} →</span>
          </Link>
        ))}
      </div>

      {/* Rate my manager — only if assigned to a team with a manager */}
      {myManager && (
        <div className="w-full max-w-md">
          <Link
            to="/rate-manager"
            className="flex items-center gap-4 px-5 py-4 rounded-xl border border-orange-300 bg-orange-600 hover:bg-orange-700 shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white shrink-0">
              <span className="text-orange-600 font-bold text-sm">
                {myManager.user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Rate {myManager.user.name}</p>
              <p className="text-xs text-orange-200">Leadership · Skills · Culture — anonymous</p>
            </div>
            <span className="text-orange-200 text-sm">→</span>
          </Link>
        </div>
      )}

      {/* Export — only if member has skills in the local store */}
      {/* {hasSkills && (
        <div className="w-full max-w-md space-y-3">
          <button
            onClick={handleExport}
            className="w-full py-3 bg-gray-800 text-white font-semibold rounded-xl hover:bg-gray-900 transition-colors"
          >
            Export .member file
          </button>
          <p className="text-xs text-gray-400 text-center">
            Share this file with your manager so they can import your profile into a team.
          </p>
        </div>
      )} */}

    </main>
  )
}
