import { Radar, RadarChart, PolarGrid, PolarAngleAxis, Tooltip, Legend } from 'recharts'
import type { GolemanRadar, GolemansStyle } from '@team-manager/shared'
import { GOLEMAN_TO_BEHAVIOR_LABEL } from '../lib/leadership-constants.js'

const STYLES: GolemansStyle[] = [
  'coercive', 'authoritative', 'pacesetting', 'democratic', 'coaching', 'visionary',
]

interface Props {
  radar: GolemanRadar
  /** Display labels keyed by style id. If omitted, raw style id is shown. */
  labels?: Record<GolemansStyle, string>
  color?: string
  /** Emphasize this style's axis label (bolder, accent color). */
  dominantStyle?: GolemansStyle
  /** Optional second radar to overlay (e.g., Layer 1 vs Layer 2 comparison). */
  compareRadar?: GolemanRadar
  /** Display label for the primary radar (used when compareRadar is set). */
  primaryLabel?: string
  /** Display label for the comparison radar. */
  compareLabel?: string
  /** Stroke color for the comparison radar. */
  compareColor?: string
}

interface TickPayload {
  payload?: { value?: string }
  x?: number
  y?: number
  textAnchor?: 'start' | 'middle' | 'end' | 'inherit'
}

export default function GolemanRadarChart({
  radar,
  labels,
  color = '#d97706',
  dominantStyle,
  compareRadar,
  primaryLabel = 'Score',
  compareLabel = 'Compare',
  compareColor = '#6b7280',
}: Props) {
  const dominantLabel = dominantStyle ? labels?.[dominantStyle] ?? dominantStyle : null
  const hasOverlay = !!compareRadar

  // Data carries both the Goleman style label and the matching ORGANIC behavior
  // so the axis tick renderer can show the triad-style double label.
  const data = STYLES.map(style => ({
    style: labels?.[style] ?? style,
    behavior: GOLEMAN_TO_BEHAVIOR_LABEL[style] ?? '',
    [primaryLabel]: radar[style],
    ...(compareRadar ? { [compareLabel]: compareRadar[style] } : {}),
    fullMark: 100,
  }))

  const renderTick = (props: TickPayload) => {
    const styleLabel = props.payload?.value ?? ''
    const matchedStyle = STYLES.find(s => (labels?.[s] ?? s) === styleLabel)
    const behaviorLabel = matchedStyle ? GOLEMAN_TO_BEHAVIOR_LABEL[matchedStyle] ?? '' : ''
    const isDominant = dominantLabel !== null && styleLabel === dominantLabel
    // Collapse to single label when style and behavior have the same word
    // (the Coaching axis), avoiding "Coaching / coaching" duplication.
    const showBehavior = behaviorLabel && behaviorLabel.toLowerCase() !== styleLabel.toLowerCase()
    const fill = isDominant ? color : '#374151'

    return (
      <text
        x={props.x}
        y={props.y}
        textAnchor={props.textAnchor}
        fill={fill}
        fontSize={isDominant ? 14 : 13}
        fontWeight={isDominant ? 700 : 600}
      >
        <tspan x={props.x} dy={0}>{styleLabel}</tspan>
        {showBehavior && (
          <tspan
            x={props.x}
            dy="1.15em"
            fontSize={10}
            fontWeight={400}
            fillOpacity={0.6}
          >
            {behaviorLabel}
          </tspan>
        )}
      </text>
    )
  }

  return (
    <RadarChart
      width={440}
      height={380}
      data={data}
      outerRadius={130}
      cx={220}
      cy={190}
      style={{ margin: '0 auto' }}
    >
      <PolarGrid />
      <PolarAngleAxis dataKey="style" tick={renderTick} />
      <Radar name={primaryLabel} dataKey={primaryLabel} stroke={color} fill={color} fillOpacity={0.25} />
      {hasOverlay && (
        <Radar
          name={compareLabel}
          dataKey={compareLabel}
          stroke={compareColor}
          fill={compareColor}
          fillOpacity={0.12}
          strokeDasharray="4 4"
        />
      )}
      <Tooltip formatter={(v) => [`${Math.round(Number(v))}`, '']} />
      {hasOverlay && <Legend wrapperStyle={{ fontSize: 12 }} />}
    </RadarChart>
  )
}
