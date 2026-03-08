import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Legend } from 'recharts'
import type { CVFScores } from '@team-manager/shared'

const QUADRANTS = ['clan', 'adhocracy', 'market', 'hierarchy'] as const
const LABELS: Record<string, string> = { clan: 'Clan', adhocracy: 'Adhocracy', market: 'Market', hierarchy: 'Hierarchy' }

interface Props {
  scores: CVFScores
  label?: string
  companyScores?: CVFScores
  desiredScores?: CVFScores
  compareScores?: CVFScores
  compareLabel?: string
}

export default function CVFRadarChart({ scores, label, companyScores, desiredScores, compareScores, compareLabel }: Props) {
  const hasOverlay = !!(companyScores || desiredScores || compareScores)

  const data = QUADRANTS.map(q => ({
    quadrant: LABELS[q],
    [label ?? 'Team']: scores[q],
    ...(companyScores ? { Company: companyScores[q] } : {}),
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
        <Radar name={mainKey} dataKey={mainKey} stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.25} />
        {companyScores && (
          <Radar name="Company" dataKey="Company" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.15} />
        )}
        {desiredScores && (
          <Radar name="Desired" dataKey="Desired" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeDasharray="5 5" />
        )}
        {compareScores && (
          <Radar name={cmpKey} dataKey={cmpKey} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.18} strokeDasharray="4 4" />
        )}
        <Tooltip formatter={(v) => [`${v}`, '']} />
        {hasOverlay && <Legend />}
      </RadarChart>
    </div>
  )
}
