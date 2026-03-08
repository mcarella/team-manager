import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Legend } from 'recharts'
import type { CVFScores } from '@team-manager/shared'

export const CVF_COLORS = {
  self:   '#7c3aed',  // purple  — me / individual
  team:   '#0891b2',  // teal    — team average
  org:    '#d97706',  // amber   — org / company average
  person: '#475569',  // slate   — specific other person
} as const

const QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const
const LABELS: Record<string, string> = { clan: 'Clan', adhocracy: 'Adhocracy', market: 'Market', hierarchy: 'Hierarchy' }

interface Props {
  scores: CVFScores
  label?: string
  mainColor?: string
  companyScores?: CVFScores
  desiredScores?: CVFScores
  compareScores?: CVFScores
  compareLabel?: string
  compareColor?: string
}

export default function CVFRadarChart({
  scores, label,
  mainColor = CVF_COLORS.self,
  companyScores, desiredScores,
  compareScores, compareLabel, compareColor = CVF_COLORS.person,
}: Props) {
  const hasOverlay = !!(companyScores || desiredScores || compareScores)

  const data = QUADRANTS.map(q => ({
    quadrant: LABELS[q],
    [label ?? 'Team']: scores[q],
    ...(companyScores ? { 'Org avg': companyScores[q] } : {}),
    ...(desiredScores ? { Desired: desiredScores[q] } : {}),
    ...(compareScores ? { [compareLabel ?? 'Compare']: compareScores[q] } : {}),
    fullMark: 600,
  }))

  const mainKey = label ?? 'Team'
  const cmpKey  = compareLabel ?? 'Compare'

  return (
    <div className="w-full space-y-4">
      <RadarChart
        width={480}
        height={420}
        data={data}
        outerRadius={150}
        cx={240}
        cy={210}
        style={{ margin: '0 auto' }}
      >
        <PolarGrid />
        <PolarAngleAxis dataKey="quadrant" tick={{ fontSize: 14, fontWeight: 600 }} />
        <Radar name={mainKey} dataKey={mainKey} stroke={mainColor} fill={mainColor} fillOpacity={0.25} />
        {companyScores && (
          <Radar name="Org avg" dataKey="Org avg" stroke={CVF_COLORS.org} fill={CVF_COLORS.org} fillOpacity={0.18} strokeDasharray="4 4" />
        )}
        {desiredScores && (
          <Radar name="Desired" dataKey="Desired" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeDasharray="5 5" />
        )}
        {compareScores && (
          <Radar name={cmpKey} dataKey={cmpKey} stroke={compareColor} fill={compareColor} fillOpacity={0.18} strokeDasharray="4 4" />
        )}
        <Tooltip formatter={(v) => [`${v}`, '']} />
        {hasOverlay && <Legend />}
      </RadarChart>
    </div>
  )
}
