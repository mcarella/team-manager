import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
import type { CVFAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import CVFResultCard from '../components/CVFResultCard.js'
import CVFRadarChart from '../components/CVFRadarChart.js'

type MemberTab  = 'mine' | 'org'
type ManagerTab = 'me' | 'team' | 'company'

export default function CVFAssessmentPage() {
  const {
    currentUserId, currentRole, saveCVFAssessment,
    members, teams, managerTeamIds,
  } = useStore()
  const navigate = useNavigate()

  const [memberTab,  setMemberTab]  = useState<MemberTab>('mine')
  const [managerTab, setManagerTab] = useState<ManagerTab>('me')
  const [result, setResult] = useState<CVFAssessment | null>(null)

  const userId = currentUserId ?? ''
  if (!userId) { navigate('/', { replace: true }); return null }

  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.cvf
  const displayResult = result ?? existingAssessment ?? null

  const handleComplete = (assessment: CVFAssessment) => {
    saveCVFAssessment(assessment)
    setResult(assessment)
  }

  // Org CVF average — computed from all members with a CVF assessment
  const membersWithCVF = members.filter(m => m.cvf)
  const orgCVF = membersWithCVF.length > 0 ? computeKiviatData(membersWithCVF).cvfAverage : null

  // Manager: My Team CVF average
  const myTeamIds = managerTeamIds[userId] ?? []
  const myTeamMembers = teams
    .filter(t => myTeamIds.includes(t.id))
    .flatMap(t => t.members)
    .filter((m, i, arr) => arr.findIndex(x => x.user.id === m.user.id) === i)
  const teamMembersWithCVF = myTeamMembers.filter(m => m.cvf)
  const teamCVF = teamMembersWithCVF.length > 0 ? computeKiviatData(teamMembersWithCVF).cvfAverage : null

  const isManager = currentRole === 'manager'

  const MEMBER_TABS:  { key: MemberTab;  label: string }[] = [
    { key: 'mine', label: 'My CVF' },
    { key: 'org',  label: 'My Org' },
  ]
  const MANAGER_TABS: { key: ManagerTab; label: string }[] = [
    { key: 'me',      label: 'Me' },
    { key: 'team',    label: 'My Team' },
    { key: 'company', label: 'Company' },
  ]

  const tabs     = isManager ? MANAGER_TABS : MEMBER_TABS
  const active   = isManager ? managerTab   : memberTab
  const setActive = (key: string) =>
    isManager ? setManagerTab(key as ManagerTab) : setMemberTab(key as MemberTab)

  const showMyCVF  = isManager ? managerTab === 'me'      : memberTab === 'mine'
  const showTeam   = isManager && managerTab === 'team'
  const showOrgCVF = isManager ? managerTab === 'company' : memberTab === 'org'

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Culture (CVF)</h1>
        <p className="text-gray-500 mt-2">
          {isManager
            ? 'Compare your culture profile with your team and the organisation.'
            : 'Distribute 100 points across 4 culture quadrants for each of 6 categories.'}
        </p>
      </div>

      {/* Tab switcher */}
      <div className="w-full max-w-lg flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              active === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Me / My CVF ───────────────────────────────────────────────────────── */}
      {showMyCVF && (
        <div className="w-full max-w-lg">
          {displayResult ? (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart scores={displayResult.results} label="You" />
              <CVFResultCard results={displayResult.results} />
              <p className="text-xs text-gray-400 text-center">
                CVF assessment is completed once and reflects your culture profile.
              </p>
            </div>
          ) : (
            <CVFForm userId={userId} onComplete={handleComplete} />
          )}
        </div>
      )}

      {/* ── My Team (manager only) ────────────────────────────────────────────── */}
      {showTeam && (
        <div className="w-full max-w-lg">
          {!teamCVF ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-lg">No CVF data yet.</p>
              <p className="text-sm">Team members need to complete their CVF assessment first.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart
                scores={teamCVF}
                label="Team avg"
                {...(orgCVF ? { companyScores: orgCVF } : {})}
              />
              <CVFResultCard results={teamCVF} />
              {orgCVF && (
                <p className="text-xs text-gray-400 text-center">
                  Dashed line shows the organisation average.
                </p>
              )}
              <p className="text-xs text-gray-400 text-center">
                Based on {teamMembersWithCVF.length} of {myTeamMembers.length} team member{myTeamMembers.length !== 1 ? 's' : ''} with a CVF assessment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── My Org / Company ──────────────────────────────────────────────────── */}
      {showOrgCVF && (
        <div className="w-full max-w-lg">
          {!orgCVF ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-lg">No CVF data yet.</p>
              <p className="text-sm">People need to complete their CVF assessment first.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart scores={orgCVF} label="Org avg" />
              <CVFResultCard results={orgCVF} />
              <p className="text-xs text-gray-400 text-center">
                Average of {membersWithCVF.length} individual{membersWithCVF.length !== 1 ? 's' : ''} who completed the CVF assessment.
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
