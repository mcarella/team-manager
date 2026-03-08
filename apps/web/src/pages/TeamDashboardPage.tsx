import { Link, useParams } from 'react-router-dom'
import { computeKiviatData } from '@team-manager/core'
// import { parseMemberFile } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import ArchetypeSpectrum from '../components/ArchetypeSpectrum.js'
import CVFRadarChart, { CVF_COLORS } from '../components/CVFRadarChart.js'
import MemberList from '../components/MemberList.js'
import TeamSkillsMatrix from '../components/TeamSkillsMatrix.js'
import TeamMemberComparisonTable from '../components/TeamMemberComparisonTable.js'
import TeamCoverageTable from '../components/TeamCoverageTable.js'

// interface ImportResult {
//   name: string
//   ok: boolean
//   message: string
// }

export default function TeamDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const { teams, roles, members: allMembers, managerTeamIds, currentUserId, currentRole } = useStore()

  // Org CVF average — computed from all unique members with a CVF assessment
  const allOrgMembers = [...new Map(
    teams.flatMap(t => t.members).map(m => [m.user.id, m])
  ).values()]
  const orgMembersWithCVF = allOrgMembers.filter(m => m.cvf)
  const orgCVF = orgMembersWithCVF.length > 0 ? computeKiviatData(orgMembersWithCVF).cvfAverage : null
  const backPath = currentRole === 'company' ? '/company' : currentRole === 'manager' ? '/manager' : '/teams'
  // Manager's own CVF for "Team vs Me" chart
  const managerCVF = allMembers.find(m => m.user.id === currentUserId)?.cvf?.results ?? null

  const team = teams.find(t => t.id === id)
  const members = team?.members ?? []
  const kiviat = computeKiviatData(members)
  const hasData = members.length > 0

  // const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const files = Array.from(e.target.files ?? [])
  //   if (!files.length) return
  //   setImporting(true)
  //   setImportResults([])
  //   const results: ImportResult[] = []
  //   for (const file of files) {
  //     try {
  //       const text = await file.text()
  //       const parsed = JSON.parse(text)
  //       const result = parseMemberFile(parsed)
  //       if (!result.ok) { results.push({ name: file.name, ok: false, message: result.error }); continue }
  //       const profile = {
  //         user: result.data.user,
  //         ...(result.data.leadership ? { leadership: result.data.leadership } : {}),
  //         ...(result.data.cvf ? { cvf: result.data.cvf } : {}),
  //         skills: result.data.skills,
  //       }
  //       importMemberToTeam(id!, profile)
  //       results.push({ name: result.data.user.name, ok: true, message: 'Imported' })
  //     } catch {
  //       results.push({ name: file.name, ok: false, message: 'Invalid JSON or unreadable file' })
  //     }
  //   }
  //   setImportResults(results)
  //   setImporting(false)
  //   if (fileInputRef.current) fileInputRef.current.value = ''
  // }

  if (!team) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Team not found.</p>
        <Link to={backPath} className="text-blue-600 hover:underline text-sm">← Back</Link>
      </main>
    )
  }

  // const successCount = importResults.filter(r => r.ok).length
  // const failCount    = importResults.filter(r => !r.ok).length

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{team.name}</h1>
            {(() => {
              const mgr = Object.entries(managerTeamIds).find(([, tids]) => tids.includes(id!))
              return mgr ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-600">
                  {mgr[0]}
                </span>
              ) : null
            })()}
          </div>
          <p className="text-gray-500 mt-1">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-4">
          {/* <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 disabled:opacity-50"
          >
            {importing ? 'Importing…' : 'Import .member'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".member"
            multiple
            className="hidden"
            onChange={handleFileImport}
          /> */}
          <Link to={backPath} className="text-blue-600 hover:underline text-sm">← Back</Link>
        </div>
      </div>

      {/* Import results summary */}
      {/* {importResults.length > 0 && (
        <div className="w-full max-w-5xl space-y-2">
          <div className="flex items-center gap-3">
            {successCount > 0 && (
              <span className="text-sm text-green-700 font-medium">
                ✓ {successCount} imported
              </span>
            )}
            {failCount > 0 && (
              <span className="text-sm text-red-600 font-medium">
                ✗ {failCount} failed
              </span>
            )}
            <button
              onClick={() => setImportResults([])}
              className="text-xs text-gray-400 hover:text-gray-600 ml-auto"
            >
              dismiss
            </button>
          </div>
          {failCount > 0 && (
            <div className="space-y-1">
              {importResults.filter(r => !r.ok).map((r, i) => (
                <p key={i} className="text-xs text-red-600 bg-red-50 rounded px-3 py-1.5">
                  <span className="font-semibold">{r.name}</span>: {r.message}
                </p>
              ))}
            </div>
          )}
        </div>
      )} */}

      {!hasData ? (
        <div className="text-center space-y-4 py-16">
          <p className="text-gray-400 text-lg">No members yet.</p>
          {/* <p className="text-gray-400 text-sm">
            Import one or more <code>.member</code> files to populate this team.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-5 py-2.5 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700"
          >
            Import .member files
          </button> */}
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-6">
          {/* 360° Coverage */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">360° Coverage</h3>
            <TeamCoverageTable members={members} />
          </div>

          {/* Archetype spectrum — full width */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <ArchetypeSpectrum distribution={kiviat.archetypeDistribution} />
          </div>

          {/* CVF charts row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Org culture avg vs team average */}
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Org Culture vs Team</h3>
              {orgCVF ? (
                <CVFRadarChart scores={kiviat.cvfAverage} label="Team" mainColor={CVF_COLORS.team} companyScores={orgCVF} />
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  No CVF data yet across the organisation.
                </div>
              )}
            </div>

            {/* Team vs Me (manager's CVF) */}
            <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm space-y-2">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Team vs Me</h3>
              {managerCVF ? (
                <CVFRadarChart
                  scores={kiviat.cvfAverage}
                  label="Team"
                  mainColor={CVF_COLORS.team}
                  compareScores={managerCVF}
                  compareLabel="Me"
                  compareColor={CVF_COLORS.self}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-sm text-gray-400">
                  Complete your CVF assessment to see this chart.
                </div>
              )}
            </div>
          </div>

{/* Skills distribution matrix — full width */}
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <TeamSkillsMatrix members={members} roles={roles} />
          </div>

          {/* Member comparison table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Members' Profiles</h3>
            <TeamMemberComparisonTable members={members} roles={roles} />
          </div>

          {/* Members */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Members</h3>
            <MemberList members={members} roles={roles} teamSize={members.length} />
          </div>
        </div>
      )}
    </main>
  )
}
