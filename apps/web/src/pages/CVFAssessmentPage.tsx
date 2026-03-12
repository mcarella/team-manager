import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
import type { CVFAssessment, CVFScores } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import CVFResultCard from '../components/CVFResultCard.js'
import CVFRadarChart, { CVF_COLORS } from '../components/CVFRadarChart.js'
import TabSwitcher from '../components/shared/TabSwitcher.js'

type MemberTab  = 'mine' | 'team' | 'org' | 'compare'
type ManagerTab = 'me' | 'team' | 'company' | 'compare'
type EntityId = string  // 'me' | 'team' | 'org' | userId

export default function CVFAssessmentPage() {
  const {
    currentUserId, currentRole, saveCVFAssessment,
    members, teams, managerTeamIds, memberTeamId,
  } = useStore()
  const navigate = useNavigate()

  const [memberTab,  setMemberTab]  = useState<MemberTab>('mine')
  const [managerTab, setManagerTab] = useState<ManagerTab>('me')
  const [result, setResult] = useState<CVFAssessment | null>(null)
  // Manager compare dropdowns
  const [teamCompareA, setTeamCompareA] = useState<EntityId>('')
  const [teamCompareB, setTeamCompareB] = useState<EntityId>('')
  // Member compare dropdowns
  const [memberCompareA, setMemberCompareA] = useState<EntityId>('')
  const [memberCompareB, setMemberCompareB] = useState<EntityId>('')

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

  // Manager: My Team CVF average (teams they manage)
  const myTeamIds = managerTeamIds[userId] ?? []
  const myTeamMembers = teams
    .filter(t => myTeamIds.includes(t.id))
    .flatMap(t => t.members)
    .filter((m, i, arr) => arr.findIndex(x => x.user.id === m.user.id) === i)
  const teamMembersWithCVF = myTeamMembers.filter(m => m.cvf)
  const teamCVF = teamMembersWithCVF.length > 0 ? computeKiviatData(teamMembersWithCVF).cvfAverage : null

  // Member: My Team CVF average — use memberTeamId map + flat members array
  const myTeamId = memberTeamId[userId]
  const memberTeam = teams.find(t => t.id === myTeamId) ?? null
  const memberTeamMembersWithCVF = members.filter(m => memberTeamId[m.user.id] === myTeamId && m.cvf)
  const memberTeamCVF = memberTeamMembersWithCVF.length > 0
    ? computeKiviatData(memberTeamMembersWithCVF).cvfAverage
    : null

  const isManager = currentRole === 'manager'

  // Comparison: find the current user's manager
  const myManagerId = myTeamId
    ? Object.entries(managerTeamIds).find(([, tIds]) => tIds.includes(myTeamId))?.[0] ?? null
    : null
  const myManagerProfile = myManagerId ? members.find(m => m.user.id === myManagerId) : null

  // Teammates (same team, excluding self) — use flat members array
  const teammates = members.filter(m => memberTeamId[m.user.id] === myTeamId && m.user.id !== userId)

  // Manager: resolve entity scores for comparison (me | teamId | org)
  const allManagedTeams = teams.filter(t => myTeamIds.includes(t.id))
  function resolveEntity(id: EntityId, context: 'manager' | 'member'): { scores: CVFScores; label: string; color: string } | null {
    if (!id) return null
    if (id === 'me') {
      const s = displayResult?.results
      return s ? { scores: s, label: 'Me', color: CVF_COLORS.self } : null
    }
    if (id === 'org') return orgCVF ? { scores: orgCVF, label: 'Org avg', color: CVF_COLORS.org } : null
    if (id === 'team') {
      const cvf = context === 'manager' ? teamCVF : memberTeamCVF
      return cvf ? { scores: cvf, label: 'My Team', color: CVF_COLORS.team } : null
    }
    if (context === 'manager') {
      const t = allManagedTeams.find(t => t.id === id)
      if (!t) return null
      const withCVF = t.members.filter(m => m.cvf)
      if (withCVF.length === 0) return null
      return { scores: computeKiviatData(withCVF).cvfAverage, label: t.name, color: CVF_COLORS.team }
    }
    // member context: id is a person's userId (manager or teammate)
    const s = members.find(m => m.user.id === id)?.cvf?.results
    const name = members.find(m => m.user.id === id)?.user.name ?? id
    return s ? { scores: s, label: name, color: CVF_COLORS.person } : null
  }
  const teamEntityA = resolveEntity(teamCompareA, 'manager')
  const teamEntityB = resolveEntity(teamCompareB, 'manager')
  const memberEntityA = resolveEntity(memberCompareA, 'member')
  const memberEntityB = resolveEntity(memberCompareB, 'member')

  const MEMBER_TABS:  { key: MemberTab;  label: string }[] = [
    { key: 'mine',    label: 'Me' },
    { key: 'team',    label: 'My Team' },
    { key: 'org',     label: 'Company' },
    { key: 'compare', label: 'Compare' },
  ]
  const MANAGER_TABS: { key: ManagerTab; label: string }[] = [
    { key: 'me',      label: 'Me' },
    { key: 'team',    label: 'My Team' },
    { key: 'company', label: 'Company' },
    { key: 'compare', label: 'Compare' },
  ]

  const tabs      = isManager ? MANAGER_TABS : MEMBER_TABS
  const active    = isManager ? managerTab   : memberTab
  const setActive = (key: string) =>
    isManager ? setManagerTab(key as ManagerTab) : setMemberTab(key as MemberTab)

  const showMyCVF   = isManager ? managerTab === 'me'      : memberTab === 'mine'
  const showTeam    = isManager ? managerTab === 'team'    : memberTab === 'team'
  const showOrgCVF  = isManager ? managerTab === 'company' : memberTab === 'org'
  const showCompare = isManager ? managerTab === 'compare' : memberTab === 'compare'

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Culture</h1>
        <p className="text-gray-500 mt-2">
          Compare your culture profile with your team and the organisation.
        </p>
      </div>

      {/* Tab switcher */}
      <TabSwitcher tabs={tabs} active={active} onChange={setActive} />

      {/* ── Me / My CVF ───────────────────────────────────────────────────────── */}
      {showMyCVF && (
        <div className="w-full max-w-lg">
          {displayResult ? (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart scores={displayResult.results} label="You" mainColor={CVF_COLORS.self} />
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

      {/* ── My Team ───────────────────────────────────────────────────────────── */}
      {showTeam && (() => {
        const cvf     = isManager ? teamCVF       : memberTeamCVF
        const withCVF = isManager ? teamMembersWithCVF.length : memberTeamMembersWithCVF.length
        const total   = isManager ? myTeamMembers.length      : members.filter(m => memberTeamId[m.user.id] === myTeamId).length
        return (
          <div className="w-full max-w-lg">
            {!cvf ? (
              <div className="text-center py-16 text-gray-400 space-y-2">
                <p className="text-lg">No CVF data yet.</p>
                <p className="text-sm">Team members need to complete their CVF assessment first.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-6">
                <CVFRadarChart scores={cvf} label="Team avg" mainColor={CVF_COLORS.team} />
                <CVFResultCard results={cvf} />
                <p className="text-xs text-gray-400 text-center">
                  Based on {withCVF} of {total} team member{total !== 1 ? 's' : ''} with a CVF assessment.
                </p>
              </div>
            )}
          </div>
        )
      })()}

      {/* ── My Org / Company ──────────────────────────────────────────────────── */}
      {showOrgCVF && (
        <div className="w-full max-w-lg">
          {!orgCVF ? (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-lg">No CVF data yet.</p>
              <p className="text-sm">Organisation members need to complete their CVF assessment first.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart scores={orgCVF} label="Org avg" mainColor={CVF_COLORS.org} />
              <CVFResultCard results={orgCVF} />
              <p className="text-xs text-gray-400 text-center">
                Average of {membersWithCVF.length} individual{membersWithCVF.length !== 1 ? 's' : ''} who completed the CVF assessment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Compare ───────────────────────────────────────────────────────────── */}
      {showCompare && (
        <div className="w-full max-w-lg flex flex-col items-center gap-6">

          {/* Manager: 2-dropdown compare */}
          {isManager ? (
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Entity A</label>
                  <select
                    value={teamCompareA}
                    onChange={e => setTeamCompareA(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Pick…</option>
                    <option value="me">Me</option>
                    {allManagedTeams.map(t => <option key={t.id} value={t.id}>{t.name} (your team)</option>)}
                    <option value="org">Org avg</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Entity B</label>
                  <select
                    value={teamCompareB}
                    onChange={e => setTeamCompareB(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    <option value="me">Me</option>
                    {allManagedTeams.map(t => <option key={t.id} value={t.id}>{t.name} (your team)</option>)}
                    <option value="org">Org avg</option>
                  </select>
                </div>
              </div>

              {teamEntityA ? (
                <>
                  <CVFRadarChart
                    scores={teamEntityA.scores}
                    label={teamEntityA.label}
                    mainColor={teamEntityA.color}
                    {...(teamEntityB ? {
                      compareScores: teamEntityB.scores,
                      compareLabel: teamEntityB.label,
                      compareColor: teamEntityB.color,
                    } : {})}
                  />
                  {teamEntityB && (
                    <div className="w-full grid grid-cols-2 gap-4">
                      <CVFResultCard results={teamEntityA.scores} label={teamEntityA.label} color={teamEntityA.color} />
                      <CVFResultCard results={teamEntityB.scores} label={teamEntityB.label} color={teamEntityB.color} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-sm text-gray-400">Select an entity to compare.</div>
              )}
            </div>
          ) : (
            /* Member: dropdown compare (same pattern as manager, scoped to visible entities) */
            <div className="w-full space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Entity A</label>
                  <select
                    value={memberCompareA}
                    onChange={e => setMemberCompareA(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">Pick…</option>
                    <option value="me">Me</option>
                    {memberTeam && <option value="team">My Team</option>}
                    {myManagerProfile && <option value={myManagerProfile.user.id}>{myManagerProfile.user.name} (manager)</option>}
                    {teammates.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                    <option value="org">Org avg</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-gray-400">Entity B</label>
                  <select
                    value={memberCompareB}
                    onChange={e => setMemberCompareB(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="">None</option>
                    <option value="me">Me</option>
                    {memberTeam && <option value="team">My Team</option>}
                    {myManagerProfile && <option value={myManagerProfile.user.id}>{myManagerProfile.user.name} (manager)</option>}
                    {teammates.map(m => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                    <option value="org">Org avg</option>
                  </select>
                </div>
              </div>

              {memberEntityA ? (
                <>
                  <CVFRadarChart
                    scores={memberEntityA.scores}
                    label={memberEntityA.label}
                    mainColor={memberEntityA.color}
                    {...(memberEntityB ? {
                      compareScores: memberEntityB.scores,
                      compareLabel: memberEntityB.label,
                      compareColor: memberEntityB.color,
                    } : {})}
                  />
                  {memberEntityB && (
                    <div className="w-full grid grid-cols-2 gap-4">
                      <CVFResultCard results={memberEntityA.scores} label={memberEntityA.label} color={memberEntityA.color} />
                      <CVFResultCard results={memberEntityB.scores} label={memberEntityB.label} color={memberEntityB.color} />
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-sm text-gray-400">Select an entity to compare.</div>
              )}
            </div>
          )}
        </div>
      )}
    </main>
  )
}
