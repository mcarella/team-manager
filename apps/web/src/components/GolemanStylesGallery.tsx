import type { GolemansStyle } from '@team-manager/shared'
import GolemanStyleCard from './GolemanStyleCard.js'

// Ordered along the ORGANIC behavior maturity progression (directing → envisioning).
const STYLE_ORDER: GolemansStyle[] = [
  'coercive',
  'pacesetting',
  'democratic',
  'coaching',
  'visionary',
  'authoritative',
]

interface Props {
  currentStyle?: GolemansStyle
}

export default function GolemanStylesGallery({ currentStyle }: Props) {
  return (
    <div className="space-y-3">
      {STYLE_ORDER.map(style => (
        <GolemanStyleCard
          key={style}
          style={style}
          size="compact"
          isCurrent={currentStyle === style}
        />
      ))}
    </div>
  )
}
