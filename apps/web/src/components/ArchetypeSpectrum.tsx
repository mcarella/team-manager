import type { Archetype } from '@team-manager/shared'

const SPECTRUM: Archetype[] = ['expert', 'coordinator', 'peer', 'coach', 'strategist']

const ARCHETYPE_META: Record<Archetype, { label: string; color: string; bg: string; border: string; role: string }> = {
  expert:      { label: 'Expert',      role: 'Manager-led',     color: '#ef4444', bg: 'bg-red-500',    border: 'border-red-300' },
  coordinator: { label: 'Coordinator', role: 'Transitioning',   color: '#f97316', bg: 'bg-orange-500', border: 'border-orange-300' },
  peer:        { label: 'Peer',        role: 'Self-managing',   color: '#3b82f6', bg: 'bg-blue-500',   border: 'border-blue-300' },
  coach:       { label: 'Coach',       role: 'Self-designing',  color: '#22c55e', bg: 'bg-green-500',  border: 'border-green-300' },
  strategist:  { label: 'Strategist',  role: 'Self-governing',  color: '#a855f7', bg: 'bg-purple-500', border: 'border-purple-300' },
}

interface Props {
  distribution: Record<Archetype, number>
}

export default function ArchetypeSpectrum({ distribution }: Props) {
  const total = Object.values(distribution).reduce((s, n) => s + n, 0)
  const covered = SPECTRUM.filter(a => distribution[a] > 0)
  const firstCovered = SPECTRUM.findIndex(a => distribution[a] > 0)
  const lastCovered  = SPECTRUM.map(a => distribution[a] > 0).lastIndexOf(true)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Archetype Spectrum</h3>
        <span className="text-xs text-gray-400">
          {covered.length} of 5 archetypes covered
        </span>
      </div>

      {/* Spectrum bar */}
      <div className="relative">
        {/* Background track */}
        <div className="flex rounded-xl overflow-hidden h-3 bg-gray-100">
          {SPECTRUM.map((archetype, i) => {
            const meta = ARCHETYPE_META[archetype]
            const pct = total > 0 ? (distribution[archetype] / total) * 100 : 0
            return (
              <div
                key={archetype}
                className="h-full transition-all duration-500"
                style={{
                  width: `${100 / 5}%`,
                  backgroundColor: distribution[archetype] > 0 ? meta.color : '#e5e7eb',
                  opacity: distribution[archetype] > 0 ? Math.max(0.4, pct / 100 + 0.3) : 1,
                }}
              />
            )
          })}
        </div>

        {/* Coverage range indicator */}
        {covered.length > 1 && (
          <div
            className="absolute top-1/2 -translate-y-1/2 h-1 bg-gray-400/30 rounded"
            style={{
              left: `${(firstCovered / 5) * 100}%`,
              width: `${((lastCovered - firstCovered + 1) / 5) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Archetype slots */}
      <div className="grid grid-cols-5 gap-1.5">
        {SPECTRUM.map(archetype => {
          const meta = ARCHETYPE_META[archetype]
          const count = distribution[archetype]
          const pct   = total > 0 ? Math.round((count / total) * 100) : 0
          const empty = count === 0

          return (
            <div
              key={archetype}
              className={`rounded-xl border-2 px-2 py-3 text-center transition-all ${
                empty
                  ? 'border-gray-100 bg-gray-50 opacity-40'
                  : `${meta.border} bg-white shadow-sm`
              }`}
            >
              {/* Dot */}
              <div
                className="w-3 h-3 rounded-full mx-auto mb-2"
                style={{ backgroundColor: empty ? '#d1d5db' : meta.color }}
              />
              <p className={`text-xs font-bold leading-tight ${empty ? 'text-gray-400' : 'text-gray-800'}`}>
                {meta.label}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{meta.role}</p>
              {!empty && (
                <p className="text-sm font-bold mt-1.5" style={{ color: meta.color }}>
                  {count} <span className="text-xs font-normal text-gray-400">({pct}%)</span>
                </p>
              )}
              {empty && (
                <p className="text-xs text-gray-300 mt-1.5">—</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Gap warning */}
      {covered.length < 5 && total > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {SPECTRUM.filter(a => distribution[a] === 0).map(a => (
            <span key={a} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5">
              Missing: {ARCHETYPE_META[a].label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
