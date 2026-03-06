import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import type { CVFScores } from '@team-manager/shared'

interface Props {
  scores: CVFScores
}

export default function CVFRadarChart({ scores }: Props) {
  const data = [
    { quadrant: 'Clan',      value: scores.clan,      fullMark: 600 },
    { quadrant: 'Adhocracy', value: scores.adhocracy,  fullMark: 600 },
    { quadrant: 'Market',    value: scores.market,     fullMark: 600 },
    { quadrant: 'Hierarchy', value: scores.hierarchy,  fullMark: 600 },
  ]

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">CVF Culture Profile</h3>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="quadrant" tick={{ fontSize: 12 }} />
          <Radar
            name="CVF"
            dataKey="value"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.25}
          />
          <Tooltip formatter={(v) => [`${v}`, 'score']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
