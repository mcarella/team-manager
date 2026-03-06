import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { Archetype } from '@team-manager/shared'

const ARCHETYPE_COLORS: Record<Archetype, string> = {
  expert:      '#ef4444',
  coordinator: '#f97316',
  peer:        '#3b82f6',
  coach:       '#22c55e',
  strategist:  '#a855f7',
}

interface Props {
  distribution: Record<Archetype, number>
}

export default function ArchetypeChart({ distribution }: Props) {
  const data = (Object.entries(distribution) as [Archetype, number][]).map(([archetype, count]) => ({
    archetype,
    count,
  }))

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Archetype Distribution</h3>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
          <XAxis dataKey="archetype" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={24} />
          <Tooltip formatter={(v) => [v, 'members']} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map(({ archetype }) => (
              <Cell key={archetype} fill={ARCHETYPE_COLORS[archetype]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
