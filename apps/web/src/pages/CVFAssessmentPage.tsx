import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    currentUserId, currentRole, saveCVFAssessment, saveCompanyProfile,
    members, companyProfile, teams, managerTeamIds,
  } = useStore()
  const navigate = useNavigate()

  const [memberTab,  setMemberTab]  = useState<MemberTab>('mine')
  const [managerTab, setManagerTab] = useState<ManagerTab>('me')

  // My CVF state
  const [result,    setResult]    = useState<CVFAssessment | null>(null)
  const [retaking,  setRetaking]  = useState(false)

  // Company edit state (manager only)
  const [redefining, setRedefining] = useState(false)

  const userId = currentUserId ?? ''
  if (!userId) { navigate('/', { replace: true }); return null }

  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.cvf
  const displayResult = result ?? (!retaking ? existingAssessment ?? null : null)

  const handleComplete = (assessment: CVFAssessment) => {
    saveCVFAssessment(assessment)
    setResult(assessment)
    setRetaking(false)
  }

  // ── Manager: My Team CVF average ──────────────────────────────────────────
  const myTeamIds = managerTeamIds[userId] ?? []
  const myTeamMembers = teams
    .filter(t => myTeamIds.includes(t.id))
    .flatMap(t => t.members)
    .filter((m, i, arr) => arr.findIndex(x => x.user.id === m.user.id) === i)
  const teamKiviat = myTeamMembers.length > 0 ? computeKiviatData(myTeamMembers) : null
  const teamCVF = teamKiviat?.cvfAverage ?? null

  const handleCompanyComplete = (assessment: CVFAssessment) => {
    saveCompanyProfile(assessment.results)
    setRedefining(false)
  }

  // ── Tabs ──────────────────────────────────────────────────────────────────
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

  const tabs    = isManager ? MANAGER_TABS : MEMBER_TABS
  const active  = isManager ? managerTab   : memberTab
  const setActive = (key: string) =>
    isManager ? setManagerTab(key as ManagerTab) : setMemberTab(key as MemberTab)

  const showMyCVF = isManager ? managerTab === 'me'   : memberTab === 'mine'
  const showOrg   = isManager ? managerTab === 'company' : memberTab === 'org'
  const showTeam  = isManager && managerTab === 'team'

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Culture (CVF)</h1>
        <p className="text-gray-500 mt-2">
          {isManager
            ? 'Compare your culture profile with your team and company.'
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
        <>
          {displayResult ? (
            <div className="flex flex-col items-center gap-6 w-full max-w-lg">
              <CVFRadarChart scores={displayResult.results} label="You" />
              <CVFResultCard results={displayResult.results} />
              <div className="flex gap-4">
                <button
                  onClick={() => { setResult(null); setRetaking(true) }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Retake assessment
                </button>
                {!isManager && (
                  <Link to="/onboarding" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                    Back to profile
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <CVFForm userId={userId} onComplete={handleComplete} />
          )}
        </>
      )}

      {/* ── My Team (manager only) ────────────────────────────────────────────── */}
      {showTeam && (
        <div className="w-full max-w-lg">
          {!teamCVF ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-lg">No team members yet.</p>
              <p className="text-sm">Add members to your team to see their aggregated culture profile.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart
                scores={teamCVF}
                label="Team avg"
                {...(companyProfile ? { companyScores: companyProfile } : {})}
              />
              <CVFResultCard results={teamCVF} />
              {companyProfile && (
                <p className="text-xs text-gray-400 text-center">
                  Dashed line shows the company culture target.
                </p>
              )}
              <p className="text-xs text-gray-400 text-center">
                Based on {myTeamMembers.filter(m => m.cvf).length} of {myTeamMembers.length} team member{myTeamMembers.length !== 1 ? 's' : ''} with a CVF assessment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── My Org / Company ──────────────────────────────────────────────────── */}
      {showOrg && (
        <div className="w-full max-w-lg">
          {isManager ? (
            // Manager: can view and redefine
            redefining ? (
              <CVFForm userId="__company__" onComplete={handleCompanyComplete} />
            ) : companyProfile ? (
              <div className="flex flex-col items-center gap-6">
                <CVFRadarChart scores={companyProfile} label="Company" />
                <CVFResultCard results={companyProfile} />
                <button
                  onClick={() => setRedefining(true)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                >
                  Redefine profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center py-8 text-gray-400 space-y-2">
                  <p className="text-lg">No company culture profile yet.</p>
                  <p className="text-sm">Define one to enable team comparison.</p>
                </div>
                <button
                  onClick={() => setRedefining(true)}
                  className="px-5 py-2.5 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 text-sm"
                >
                  Define company profile
                </button>
              </div>
            )
          ) : (
            // Member: read-only
            companyProfile ? (
              <div className="flex flex-col items-center gap-6">
                <CVFRadarChart scores={companyProfile} label="Organisation" />
                <CVFResultCard results={companyProfile} />
                <p className="text-xs text-gray-400 text-center">
                  This is your organisation's culture profile, defined by the company admin.
                </p>
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 space-y-2">
                <p className="text-lg">No organisation profile yet.</p>
                <p className="text-sm">Ask your company admin to define the culture profile.</p>
              </div>
            )
          )}
        </div>
      )}
    </main>
  )
}
