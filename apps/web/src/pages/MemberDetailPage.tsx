import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { computeProfileReliability } from '@team-manager/core'
import type { PeerLeadershipSummary, LeadershipAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import ArchetypeCard from '../components/ArchetypeCard.js'
import CVFRadarChart, { CVF_COLORS as CVF_CHART_COLORS } from '../components/CVFRadarChart.js'
import ReliabilityCoverage from '../components/ReliabilityCoverage.js'

const API = 'http://localhost:3001'

const LEVEL_LABELS: Record<number, string> = {
  0: "Don't know", 1: 'Know theory', 2: 'Autonomous', 3: 'Master', 4: 'Can teach',
}
const LEVEL_BAR: Record<number, string> = {
  0: 'bg-gray-400', 1: 'bg-blue-500', 2: 'bg-green-600', 3: 'bg-purple-600', 4: 'bg-amber-500',
}
const CVF_COLORS: Record<string, string> = {
  clan: 'bg-green-50 text-green-700', adhocracy: 'bg-blue-50 text-blue-700',
  market: 'bg-orange-50 text-orange-700', hierarchy: 'bg-gray-100 text-gray-700',
}

type Section = 'archetype' | 'cvf' | 'skills'
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'archetype', label: 'Archetype' },
  { id: 'cvf',       label: 'Culture (CVF)' },
  { id: 'skills',    label: 'Skills & 360°' },
]

interface PeerSkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

export default function MemberDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const { members, roles, teams } = useStore()

  const section = (searchParams.get('section') as Section) ?? 'archetype'
  const member = members.find(m => m.user.id === userId)

  const [peerSummary, setPeerSummary] = useState<PeerSkillSummary | null>(null)
  const [peerLeadership, setPeerLeadership] = useState<PeerLeadershipSummary | null>(null)

  useEffect(() => {
    if (!userId) return
    fetch(`${API}/peer-assessments/skills/${userId}/summary`)
      .then(r => r.json()).then(setPeerSummary).catch(() => {})
    fetch(`${API}/peer-assessments/leadership/${userId}/summary`)
      .then(r => r.json()).then(setPeerLeadership).catch(() => {})
  }, [userId])

  // Team size for this member (use the largest team they belong to)
  const memberTeams = teams.filter(t => t.members.some(m => m.user.id === userId))
  const teamSize = memberTeams.reduce((max, t) => Math.max(max, t.members.length), 0)

  const nameMap = new Map<string, string>()
  for (const r of roles) {
    for (const s of r.skills) if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
  }

  if (!member) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500">Member not found.</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline text-sm">← Back</button>
      </main>
    )
  }

  const { user, leadership, cvf, skills } = member

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-6">
      {/* Header */}
      <div className="w-full max-w-2xl flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-base font-bold text-gray-600">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              {user.role === 'manager' && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-100 text-orange-700">Manager</span>
              )}
            </div>
            <p className="text-xs text-gray-400">{user.id}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl flex gap-1 bg-gray-100 p-1 rounded-xl">
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setSearchParams({ section: s.id })}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              section === s.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="w-full max-w-2xl">
        {section === 'archetype' && (
          leadership ? (
            <div className="space-y-6">
              <ArchetypeCard assessment={leadership} />
              {peerLeadership && peerLeadership.totalEvaluators > 0 && (
                <PeerLeadershipDelta self={leadership} peer={peerLeadership} />
              )}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">No leadership assessment yet.</p>
          )
        )}

        {section === 'cvf' && (
          cvf ? (
            <div className="space-y-4">
              <CVFRadarChart scores={cvf.results} mainColor={CVF_CHART_COLORS.self} />
              <div className="grid grid-cols-2 gap-3">
                {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(q => (
                  <div key={q} className={`rounded-xl px-4 py-3 text-center ${CVF_COLORS[q]}`}>
                    <p className="text-xs capitalize opacity-70 mb-1">{q}</p>
                    <p className="text-2xl font-bold">{cvf.results[q]}</p>
                    <p className="text-xs opacity-50">/ 600</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">No CVF assessment yet.</p>
          )
        )}

        {section === 'skills' && (
          skills.length > 0 ? (
            <div className="space-y-4">
              {peerSummary && (
                <div className="bg-white rounded-xl border border-gray-100 p-4">
                  <ReliabilityCoverage
                    reliability={computeProfileReliability(peerSummary.totalEvaluators, teamSize)}
                    full
                  />
                </div>
              )}
              <div className="space-y-5">
                {skills
                  .slice()
                  .sort((a, b) => b.level - a.level)
                  .map(sa => {
                    const peer = peerSummary?.skills[sa.skillId]
                    const delta = peer ? peer.average - sa.level : null
                    return (
                      <div key={sa.skillId} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-800">{nameMap.get(sa.skillId) ?? sa.skillId}</span>
                          {delta !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              Math.abs(delta) <= 0.5 ? 'bg-green-100 text-green-700' :
                              delta < 0 ? 'bg-amber-100 text-amber-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {Math.abs(delta) <= 0.5 ? 'Aligned' : delta < 0 ? '⚠ Blind spot' : '✨ Hidden strength'}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Self</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${LEVEL_BAR[sa.level]}`} style={{ width: `${(sa.level / 4) * 100}%` }} />
                          </div>
                          <span className="text-xs text-gray-500 w-24 shrink-0">{sa.level} — {LEVEL_LABELS[sa.level]}</span>
                        </div>
                        {peer && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Peers</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full opacity-50 ${LEVEL_BAR[Math.round(peer.average)]}`} style={{ width: `${(peer.average / 4) * 100}%` }} />
                            </div>
                            <span className="text-xs text-gray-500 w-24 shrink-0">{peer.average.toFixed(1)} — {LEVEL_LABELS[Math.round(peer.average)]}</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">No skills assessment yet.</p>
          )
        )}
      </div>
    </main>
  )
}

// ── Peer Leadership Delta ─────────────────────────────────────────────────────

const BEHAVIOR_PAIRS = ['catalyzing', 'envisioning', 'demanding', 'coaching', 'conducting', 'directing'] as const
const BEHAVIOR_LABELS: Record<string, string> = {
  catalyzing: 'Catalyzing', envisioning: 'Envisioning', demanding: 'Demanding',
  coaching: 'Coaching', conducting: 'Conducting', directing: 'Directing',
}
const GOLEMAN_MOTTOS: Record<string, string> = {
  catalyzing: '"See the whole picture"', envisioning: '"Come with me"',
  demanding: '"Do as I do, now"', coaching: '"Try this"',
  conducting: '"What do you think?"', directing: '"Do what I tell you"',
}
const ARCHETYPE_COLORS: Record<string, string> = {
  expert: 'bg-red-100 text-red-700', coordinator: 'bg-orange-100 text-orange-700',
  peer: 'bg-blue-100 text-blue-700', coach: 'bg-green-100 text-green-700',
  strategist: 'bg-purple-100 text-purple-700',
}

function PeerLeadershipDelta({
  self,
  peer,
}: {
  self: LeadershipAssessment
  peer: PeerLeadershipSummary
}) {
  const mismatch = peer.dominantArchetype && self.archetype !== peer.dominantArchetype
  const lowConfidence = peer.totalEvaluators < 3

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Peer Leadership Delta</h3>
        <span className="text-xs text-gray-400">{peer.totalEvaluators} evaluator{peer.totalEvaluators !== 1 ? 's' : ''}</span>
      </div>

      {lowConfidence && (
        <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          ⚠️ Low confidence — only {peer.totalEvaluators}/3+ peers evaluated. Results may not be representative.
        </p>
      )}

      {/* Archetype comparison */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Self</span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ARCHETYPE_COLORS[self.archetype] ?? 'bg-gray-100 text-gray-600'}`}>{self.archetype}</span>
        </div>
        {peer.dominantArchetype && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Peers</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${ARCHETYPE_COLORS[peer.dominantArchetype] ?? 'bg-gray-100 text-gray-600'}`}>{peer.dominantArchetype}</span>
          </div>
        )}
      </div>

      {mismatch && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          <span className="font-semibold">Archetype mismatch</span> — self-assessed as <span className="font-semibold capitalize">{self.archetype}</span>, peers perceive <span className="font-semibold capitalize">{peer.dominantArchetype}</span>.
        </div>
      )}

      {/* Behavior bars */}
      <div className="space-y-3">
        {BEHAVIOR_PAIRS.map(b => {
          const selfScore = self.scores[b] ?? 0
          const peerAvg = peer.behaviors[b].average
          const delta = peerAvg - selfScore
          return (
            <div key={b} className="space-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-gray-700">{BEHAVIOR_LABELS[b]}</span>
                  <span className="text-xs text-gray-400 ml-2">{GOLEMAN_MOTTOS[b]}</span>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  Math.abs(delta) <= 2 ? 'bg-green-100 text-green-700' :
                  delta < 0 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {Math.abs(delta) <= 2 ? 'Aligned' : delta < 0 ? '⚠ Blind spot' : '✨ Hidden strength'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Self</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(selfScore / 20) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-6 shrink-0">{selfScore}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-12 shrink-0 text-right">Peers</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 opacity-60 rounded-full" style={{ width: `${(peerAvg / 20) * 100}%` }} />
                </div>
                <span className="text-xs text-gray-500 w-6 shrink-0">{peerAvg.toFixed(1)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
