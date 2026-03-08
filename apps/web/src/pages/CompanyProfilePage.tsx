import { useState, useMemo } from 'react'
import { computeKiviatData } from '@team-manager/core'
import type { CVFScores } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFRadarChart from '../components/CVFRadarChart.js'
import CVFResultCard from '../components/CVFResultCard.js'

type EntityId = string // 'org' | 'team:<id>' | 'manager:<id>'

export default function CompanyProfilePage() {
  const { members, teams } = useStore()

  const [entityA, setEntityA] = useState<EntityId>('org')
  const [entityB, setEntityB] = useState<EntityId>('')

  // Org CVF average
  const membersWithCVF = members.filter(m => m.cvf)
  const orgCVF = membersWithCVF.length > 0 ? computeKiviatData(membersWithCVF).cvfAverage : null

  // Team CVF averages
  const teamCVFs = useMemo(() => {
    return teams.map(t => {
      const withCVF = t.members.filter(m => m.cvf)
      return {
        id: `team:${t.id}`,
        label: t.name,
        scores: withCVF.length > 0 ? computeKiviatData(withCVF).cvfAverage : null,
      }
    })
  }, [teams])

  // Manager CVF profiles
  const managerCVFs = useMemo(() => {
    return members
      .filter(m => m.user.role === 'manager' && m.cvf)
      .map(m => ({ id: `manager:${m.user.id}`, label: m.user.name, scores: m.cvf!.results }))
  }, [members])

  const entities = [
    { id: 'org', label: 'Org average', scores: orgCVF },
    ...teamCVFs,
    ...managerCVFs,
  ]

  function resolveScores(id: EntityId): { scores: CVFScores; label: string } | null {
    const e = entities.find(x => x.id === id)
    return e?.scores ? { scores: e.scores, label: e.label } : null
  }

  const a = entityA ? resolveScores(entityA) : null
  const b = entityB ? resolveScores(entityB) : null

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Culture Comparison</h1>
        <p className="text-gray-500 mt-2">
          Compare CVF profiles across teams, managers, and the whole organisation.
        </p>
      </div>

      {/* Entity pickers */}
      <div className="w-full max-w-lg grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity A</label>
          <select
            value={entityA}
            onChange={e => setEntityA(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">Pick entity…</option>
            <optgroup label="Organisation">
              <option value="org">Org average</option>
            </optgroup>
            <optgroup label="Teams">
              {teamCVFs.map(t => (
                <option key={t.id} value={t.id} disabled={!t.scores}>{t.label}{!t.scores ? ' (no data)' : ''}</option>
              ))}
            </optgroup>
            <optgroup label="Managers">
              {managerCVFs.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Entity B</label>
          <select
            value={entityB}
            onChange={e => setEntityB(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
          >
            <option value="">None</option>
            <optgroup label="Organisation">
              <option value="org">Org average</option>
            </optgroup>
            <optgroup label="Teams">
              {teamCVFs.map(t => (
                <option key={t.id} value={t.id} disabled={!t.scores}>{t.label}{!t.scores ? ' (no data)' : ''}</option>
              ))}
            </optgroup>
            <optgroup label="Managers">
              {managerCVFs.map(m => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>

      {/* Chart */}
      {a ? (
        <div className="w-full max-w-lg flex flex-col items-center gap-6">
          <CVFRadarChart
            scores={a.scores}
            label={a.label}
            {...(b ? { compareScores: b.scores, compareLabel: b.label } : {})}
          />
          <div className={`w-full grid gap-4 ${b ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <div className="space-y-2">
              {b && <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">{a.label}</p>}
              <CVFResultCard results={a.scores} />
            </div>
            {b && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{b.label}</p>
                <CVFResultCard results={b.scores} />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Select an entity to view its CVF profile.</p>
        </div>
      )}
    </main>
  )
}
