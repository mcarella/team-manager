import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Legend } from 'recharts'

interface Axis {
  label: string
  value: number
  /** Optional second-line label rendered below the main label (smaller, dimmer).
   *  Used on Layer 1 Behavior Scores to pair ORGANIC behaviors with their
   *  Goleman styles, mirroring the GolemanRadarChart convention. */
  secondaryLabel?: string
}

interface OverlaySeries {
  name: string
  /** One value per axis, in the same order as `axes`. */
  values: number[]
  color: string
}

interface Props {
  axes: Axis[]
  /** Maximum possible value (e.g., 20 for ORGANIC behavior scores, 100 for drives). */
  fullMark: number
  color: string
  /** Name for the primary series (used in legend when overlay is present). Defaults to "You". */
  seriesName?: string
  /** Optional second series rendered on top of the primary one — used for self-vs-peer overlays. */
  overlay?: OverlaySeries
  /** Axis labels to emphasize (bolder, larger, accent-colored). */
  highlightLabels?: string[]
  width?: number
  height?: number
  outerRadius?: number
}

interface TickPayload {
  payload?: { value?: string }
  x?: number
  y?: number
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
}

/**
 * Small reusable Kiviat (radar) chart for arbitrary scored axes.
 * Used by ArchetypeCard for the 6 ORGANIC Behavior Scores and by
 * BehavioralCoreSection for the 4 Behavioral Drives.
 */
export default function KiviatChart({
  axes,
  fullMark,
  color,
  seriesName = 'You',
  overlay,
  highlightLabels,
  width,
  height,
  outerRadius = 120,
}: Props) {
  const hasSecondary = axes.some(a => a.secondaryLabel)
  // Give the chart more vertical room when we need to render two lines per tick.
  const w = width  ?? (hasSecondary ? 460 : 420)
  const h = height ?? (hasSecondary ? 380 : 340)

  const data = axes.map((a, i) => {
    const row: Record<string, string | number> = { axis: a.label, fullMark }
    row[seriesName] = a.value
    if (overlay) row[overlay.name] = overlay.values[i] ?? 0
    return row
  })
  const highlightSet = new Set(highlightLabels ?? [])
  // Lookup from primary label → secondary so the tick renderer can find it
  // (Recharts hands us only the primary `axis` string in the tick payload).
  const secondaryByLabel = new Map(
    axes.filter(a => a.secondaryLabel).map(a => [a.label, a.secondaryLabel!])
  )

  const useCustomTick = highlightLabels || hasSecondary
  const renderTick = (props: TickPayload) => {
    const value = props.payload?.value ?? ''
    const isHighlight = highlightSet.has(value)
    const secondary = secondaryByLabel.get(value)
    // Collapse if primary and secondary are the same word (e.g. "Coaching" / "coaching").
    const showSecondary = secondary && secondary.toLowerCase() !== value.toLowerCase()
    return (
      <text
        x={props.x}
        y={props.y}
        textAnchor={props.textAnchor}
        fill={isHighlight ? color : '#374151'}
        fontSize={isHighlight ? 14 : 12}
        fontWeight={isHighlight ? 700 : 600}
      >
        <tspan x={props.x} dy={0}>{value}</tspan>
        {showSecondary && (
          <tspan
            x={props.x}
            dy="1.15em"
            fontSize={10}
            fontWeight={400}
            fillOpacity={0.6}
          >
            {secondary}
          </tspan>
        )}
      </text>
    )
  }

  return (
    <RadarChart
      width={w}
      height={h}
      data={data}
      outerRadius={outerRadius}
      cx={w / 2}
      cy={h / 2}
      style={{ margin: '0 auto' }}
    >
      <PolarGrid />
      <PolarAngleAxis
        dataKey="axis"
        tick={useCustomTick ? renderTick : { fontSize: 12, fontWeight: 600, fill: '#374151' }}
      />
      <Radar name={seriesName} dataKey={seriesName} stroke={color} fill={color} fillOpacity={overlay ? 0.18 : 0.25} strokeWidth={2} />
      {overlay && (
        <Radar
          name={overlay.name}
          dataKey={overlay.name}
          stroke={overlay.color}
          fill={overlay.color}
          fillOpacity={0.15}
          strokeWidth={2}
          strokeDasharray="4 3"
        />
      )}
      <Tooltip formatter={(v) => [`${Math.round(Number(v))} / ${fullMark}`, '']} />
      {overlay && <Legend verticalAlign="bottom" wrapperStyle={{ fontSize: 11, paddingTop: 4 }} iconSize={10} />}
    </RadarChart>
  )
}
