import { useTranslation } from 'react-i18next'
import type { PQInterpretation } from '@team-manager/shared'

interface Props {
  /** 0-100. */
  score: number
  interpretation: PQInterpretation
  /** Pixel width — height scales to ~60% of width. */
  width?: number
}

/**
 * Semi-circular gauge showing a 0-100 PQ score.
 * Color zones (red/orange/amber/green/emerald) and tipping-point marker at 75.
 */
export default function PQGauge({ score, interpretation, width = 320 }: Props) {
  const { t } = useTranslation(['layer3'])
  const clamped = Math.max(0, Math.min(100, score))
  const height = Math.round(width * 0.6)
  const cx = width / 2
  const cy = height - 20
  const r = (width - 40) / 2
  const stroke = 14

  // Map 0-100 → angle (180° at score 0, 0° at score 100)
  const angleAt = (s: number) => 180 - (s / 100) * 180
  const polar = (angleDeg: number) => {
    const rad = (Math.PI * angleDeg) / 180
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }
  const arcPath = (fromScore: number, toScore: number) => {
    const start = polar(angleAt(fromScore))
    const end = polar(angleAt(toScore))
    return `M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`
  }

  const zones: Array<{ from: number; to: number; color: string }> = [
    { from: 0,  to: 50, color: '#ef4444' },  // critical
    { from: 50, to: 65, color: '#f97316' },  // mixed
    { from: 65, to: 75, color: '#f59e0b' },  // good
    { from: 75, to: 85, color: '#10b981' },  // excellent
    { from: 85, to: 100, color: '#059669' }, // mastery
  ]

  const needleAngle = angleAt(clamped)
  const needleEnd = polar(needleAngle)
  const tippingPoint = polar(angleAt(75))

  return (
    <div className="flex flex-col items-center space-y-3">
      <svg width={width} height={height + 8} viewBox={`0 0 ${width} ${height + 8}`}>
        {/* Background track */}
        <path
          d={arcPath(0, 100)}
          stroke="#f3f4f6"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
        />
        {/* Colored zones */}
        {zones.map(z => (
          <path
            key={`${z.from}-${z.to}`}
            d={arcPath(z.from, z.to)}
            stroke={z.color}
            strokeWidth={stroke}
            fill="none"
            opacity={0.85}
          />
        ))}
        {/* Tipping point marker */}
        <line
          x1={tippingPoint.x}
          y1={tippingPoint.y - 10}
          x2={tippingPoint.x}
          y2={tippingPoint.y + 10}
          stroke="#1f2937"
          strokeWidth={2}
        />
        <text
          x={tippingPoint.x}
          y={tippingPoint.y - 14}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill="#374151"
        >
          75
        </text>
        {/* Needle */}
        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#1f2937"
          strokeWidth={3}
          strokeLinecap="round"
        />
        <circle cx={cx} cy={cy} r={6} fill="#1f2937" />
        {/* Score label */}
        <text
          x={cx}
          y={cy - 30}
          textAnchor="middle"
          fontSize={36}
          fontWeight={700}
          fill="#1f2937"
        >
          {clamped}
        </text>
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          fontSize={11}
          fontWeight={500}
          fill="#6b7280"
        >
          PQ score
        </text>
      </svg>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold" style={{ color: interpretation.color }}>
          {t(interpretation.labelKey)}
        </p>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          {t(interpretation.descriptionKey)}
        </p>
      </div>
    </div>
  )
}
