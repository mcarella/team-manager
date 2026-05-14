import { useTranslation } from 'react-i18next'
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts'
import type { AdjectiveFrequency } from '@team-manager/shared'

const FACTOR_COLOR: Record<AdjectiveFrequency['factor'], string> = {
  dominance:    '#ef4444',
  extraversion: '#f59e0b',
  patience:     '#10b981',
  formality:    '#6366f1',
  objectivity:  '#94a3b8',
}

interface Props {
  /** Output of `computeAdjectiveCloud(summary, topN)`. */
  data: AdjectiveFrequency[]
  /** Total peer evaluators — used in the tooltip "N of M peers" copy. */
  totalEvaluators: number
  height?: number
}

interface TreemapNodeProps {
  x?: number
  y?: number
  width?: number
  height?: number
  index?: number
  depth?: number
  // Recharts 2.x passes the leaf's data fields directly on the cell props.
  name?: string
  fill?: string
  size?: number
  count?: number
  // Older Recharts versions wrap them in `payload` — we read both as a fallback.
  payload?: { name?: string; size?: number; fill?: string; count?: number }
}

/**
 * Space-filling treemap of peer-picked adjectives.
 * Rectangle area scales with pick frequency; fill color encodes the behavioral
 * factor (red Dominance, amber Extraversion, emerald Patience, indigo Formality,
 * slate Objectivity). Tiny cells skip the label and rely on the hover tooltip.
 */
export default function AdjectiveTreemap({ data, totalEvaluators, height = 320 }: Props) {
  const { t } = useTranslation(['layer2'])

  if (data.length === 0) {
    return (
      <div className="text-sm text-gray-400 text-center py-12 border border-dashed rounded-xl">
        No peer evaluations yet — nothing to plot.
      </div>
    )
  }

  // Recharts Treemap expects `{name, size, ...other}` records.
  const treemapData = data.map(a => ({
    name: t(`layer2:adjectives.${a.adjectiveId}`),
    size: a.count,
    fill: FACTOR_COLOR[a.factor],
    rawId: a.adjectiveId,
    count: a.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <Treemap
        data={treemapData}
        dataKey="size"
        nameKey="name"
        stroke="#fff"
        animationDuration={300}
        content={<TreemapCell />}
      >
        <Tooltip
          formatter={(value, _name, props) => {
            const payload = (props as { payload?: { name?: string; count?: number } }).payload
            const count = payload?.count ?? Number(value)
            return [`${count} of ${totalEvaluators} peers picked this`, payload?.name ?? '']
          }}
        />
      </Treemap>
    </ResponsiveContainer>
  )
}

// ── Custom cell renderer ─────────────────────────────────────────────────────

function TreemapCell(props: TreemapNodeProps) {
  const { x = 0, y = 0, width = 0, height = 0, depth = 0 } = props
  // Recharts renders the synthetic root (depth 0) covering the whole chart —
  // skip it so it doesn't paint a giant grey block on top of the leaves.
  if (depth === 0 || width <= 0 || height <= 0) return null

  const name = props.name ?? props.payload?.name ?? ''
  const fill = props.fill ?? props.payload?.fill ?? '#94a3b8'

  // Size the label to the cell, then make sure it actually fits horizontally.
  // SVG text is roughly 0.55 × fontSize per character in a normal weight; we
  // pick the largest font where (name.length × 0.55 × fontSize) ≤ width − 8px padding.
  const cellMin = Math.min(width, height)
  const idealFont = Math.max(9, Math.min(14, Math.floor(cellMin / 5)))
  const maxFontForWidth = Math.floor((width - 8) / Math.max(1, name.length * 0.55))
  const fontSize = Math.max(9, Math.min(idealFont, maxFontForWidth))
  const showLabel = width >= 44 && height >= 22 && fontSize >= 9 && name.length * fontSize * 0.55 <= width - 6

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={fill}
        stroke="#fff"
        strokeWidth={2}
      />
      {showLabel && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={fontSize}
          fontWeight={400}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {name}
        </text>
      )}
    </g>
  )
}
