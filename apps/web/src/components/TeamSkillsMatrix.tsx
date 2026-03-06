import { useState } from 'react'
import type { TeamMemberProfile, SkillRole } from '@team-manager/shared'

const LEVEL_LABELS = ['Don\'t know', 'Theory', 'Autonomous', 'Master', 'Can teach']
const LEVEL_COLORS = ['#9ca3af', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b']

interface SkillStats {
  skillId: string
  name: string
  assessed: number
  total: number
  coverage: number
  average: number
  stdDev: number
  confidence: 'high' | 'medium' | 'low'
  distribution: number[] // count at each level 0-4
  members: { name: string; level: number }[]
}

function computeSkillStats(
  members: TeamMemberProfile[],
  roles: SkillRole[],
): SkillStats[] {
  // Build skill name lookup from roles
  const nameMap = new Map<string, string>()
  for (const r of roles) {
    for (const s of r.skills) {
      if (!nameMap.has(s.id)) nameMap.set(s.id, s.name)
    }
  }

  // Collect all skill IDs that appear in the team
  const skillBuckets = new Map<string, { name: string; level: number }[]>()
  for (const m of members) {
    for (const sa of m.skills) {
      if (!skillBuckets.has(sa.skillId)) skillBuckets.set(sa.skillId, [])
      skillBuckets.get(sa.skillId)!.push({ name: m.user.name, level: sa.level })
    }
  }

  const total = members.length
  const stats: SkillStats[] = []

  for (const [skillId, entries] of skillBuckets) {
    const assessed = entries.length
    const coverage = total > 0 ? assessed / total : 0
    const levels = entries.map(e => e.level)
    const average = levels.reduce((s, l) => s + l, 0) / levels.length
    const variance = levels.reduce((s, l) => s + (l - average) ** 2, 0) / levels.length
    const stdDev = Math.sqrt(variance)

    // Distribution: count at each level
    const distribution = [0, 0, 0, 0, 0]
    for (const l of levels) distribution[l]!++

    // Confidence = f(coverage, agreement)
    // High: >=75% coverage AND stdDev <= 1.0
    // Low: <40% coverage OR stdDev > 1.5
    // Medium: everything else
    let confidence: 'high' | 'medium' | 'low'
    if (coverage >= 0.75 && stdDev <= 1.0) confidence = 'high'
    else if (coverage < 0.4 || stdDev > 1.5) confidence = 'low'
    else confidence = 'medium'

    stats.push({
      skillId,
      name: nameMap.get(skillId) ?? skillId,
      assessed,
      total,
      coverage,
      average,
      stdDev,
      confidence,
      distribution,
      members: entries.sort((a, b) => b.level - a.level),
    })
  }

  // Sort: by average descending, then by coverage descending
  stats.sort((a, b) => b.average - a.average || b.coverage - a.coverage)
  return stats
}

const CONFIDENCE_BADGE: Record<string, string> = {
  high:   'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-red-100 text-red-600',
}

interface Props {
  members: TeamMemberProfile[]
  roles: SkillRole[]
}

export default function TeamSkillsMatrix({ members, roles }: Props) {
  const stats = computeSkillStats(members, roles)

  if (stats.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Distribution</h3>
        <p className="text-sm text-gray-400">No skill assessments in this team yet.</p>
      </div>
    )
  }

  const maxAssessed = Math.max(...stats.map(s => s.assessed))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Skills Distribution</h3>
        <div className="flex gap-3 text-xs text-gray-400">
          {LEVEL_LABELS.map((label, i) => (
            <span key={i} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: LEVEL_COLORS[i] }} />
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {stats.map(skill => (
          <SkillRow key={skill.skillId} skill={skill} maxAssessed={maxAssessed} />
        ))}
      </div>

      {/* Confidence legend */}
      <div className="flex items-center gap-4 pt-2 text-xs text-gray-400">
        <span>Confidence:</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> High ({'\u2265'}75% coverage, low spread)
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-amber-500" /> Medium
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Low ({'<'}40% coverage or high spread)
        </span>
      </div>
    </div>
  )
}

function SkillRow({ skill, maxAssessed }: { skill: SkillStats; maxAssessed: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
      >
        {/* Skill name */}
        <div className="w-40 shrink-0">
          <p className="text-sm font-medium text-gray-800 truncate">{skill.name}</p>
          <p className="text-xs text-gray-400">{skill.assessed}/{skill.total} assessed</p>
        </div>

        {/* Stacked distribution bar */}
        <div className="flex-1 flex items-center gap-2">
          <div className="flex-1 flex h-5 rounded-lg overflow-hidden bg-gray-50">
            {skill.distribution.map((count, level) => {
              if (count === 0) return null
              const pct = (count / maxAssessed) * 100
              return (
                <div
                  key={level}
                  className="h-full transition-all duration-300 flex items-center justify-center"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: LEVEL_COLORS[level],
                    minWidth: count > 0 ? '16px' : 0,
                  }}
                  title={`${LEVEL_LABELS[level]}: ${count}`}
                >
                  {count > 0 && (
                    <span className="text-[10px] font-bold text-white">{count}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Average */}
        <div className="w-16 text-center shrink-0">
          <p className="text-sm font-bold text-gray-800">{skill.average.toFixed(1)}</p>
          <p className="text-[10px] text-gray-400">avg</p>
        </div>

        {/* Spread */}
        <div className="w-14 text-center shrink-0">
          <p className="text-xs text-gray-500">{'\u00b1'}{skill.stdDev.toFixed(1)}</p>
        </div>

        {/* Confidence */}
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${CONFIDENCE_BADGE[skill.confidence]}`}>
          {skill.confidence}
        </span>
      </button>

      {/* Expanded: per-member breakdown */}
      {expanded && (
        <div className="px-4 pb-3 border-t border-gray-50 pt-2">
          <div className="flex flex-wrap gap-2">
            {skill.members.map(m => (
              <span
                key={m.name}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs"
                style={{
                  backgroundColor: LEVEL_COLORS[m.level] + '20',
                  color: LEVEL_COLORS[m.level],
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: LEVEL_COLORS[m.level] }}
                />
                {m.name}: {LEVEL_LABELS[m.level]}
              </span>
            ))}
            {/* Show members who haven't assessed this skill */}
            {skill.assessed < skill.total && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-gray-50 text-gray-400">
                +{skill.total - skill.assessed} not assessed
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
