import { useTranslation } from 'react-i18next'
import type { SagePowerId } from '@team-manager/shared'

interface Props {
  sagePowerId: SagePowerId
  /** Optional caption shown above the tagline (e.g. "Antidote to Judge"). */
  caption?: string
}

/**
 * Reusable Sage Power card. Emerald accent (sage = constructive).
 * Used in:
 *  - Saboteur result page → "Sage Powers — your antidotes" 3-col grid
 *  - Growth page → paired antidote next to each top saboteur card
 */
export default function SagePowerCard({ sagePowerId, caption }: Props) {
  const { t } = useTranslation(['layer3'])
  return (
    <article className="rounded-2xl border-2 border-emerald-200 bg-white p-4 space-y-1.5">
      {caption && (
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          {caption}
        </p>
      )}
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">
        {t(`layer3:sagePowers.${sagePowerId}.tagline`)}
      </p>
      <h3 className="text-lg font-bold text-gray-900">
        {t(`layer3:sagePowers.${sagePowerId}.name`)}
      </h3>
      <p className="text-xs text-gray-600 leading-relaxed">
        {t(`layer3:sagePowers.${sagePowerId}.description`)}
      </p>
    </article>
  )
}
