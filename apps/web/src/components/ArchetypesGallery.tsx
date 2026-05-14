import type { BehavioralCoreSubProfile } from '@team-manager/shared'
import { useTranslation } from 'react-i18next'
import { SUB_PROFILES, type SubProfileGroup } from '@team-manager/core'
import Layer2ArchetypeCard from './Layer2ArchetypeCard.js'

const GROUP_ORDER: SubProfileGroup[] = ['analytical', 'social', 'stabilizing', 'persistent']

const GROUP_ACCENT: Record<SubProfileGroup, string> = {
  analytical:  '#4f46e5',
  social:      '#d97706',
  stabilizing: '#059669',
  persistent:  '#dc2626',
}

const GROUP_DESCRIPTIONS: Record<SubProfileGroup, string> = {
  analytical:  'Driven by results, structure, and data. Thrives on precision and depth.',
  social:      'Energized by people and influence. Thrives on communication and relationships.',
  stabilizing: 'Anchored by steadiness and consistency. Thrives on reliability and care.',
  persistent:  'Driven by autonomy and intellectual depth. Thrives working independently on high standards.',
}

interface Props {
  currentProfileId?: BehavioralCoreSubProfile
  autoExpandCurrent?: boolean
}

export default function ArchetypesGallery({ currentProfileId, autoExpandCurrent = false }: Props) {
  const { t } = useTranslation(['layer2'])
  return (
    <div className="space-y-6">
      {GROUP_ORDER.map(group => {
        const profiles = SUB_PROFILES.filter(p => p.group === group)
        const accent = GROUP_ACCENT[group]
        return (
          <section key={group} className="space-y-2">
            <div>
              <h3 className="text-base font-bold capitalize" style={{ color: accent }}>
                {t(`layer2:result.groupLabels.${group}`)}{' '}
                <span className="text-xs font-medium opacity-60">· {profiles.length}</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{GROUP_DESCRIPTIONS[group]}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profiles.map(profile => (
                <Layer2ArchetypeCard
                  key={profile.id}
                  profileId={profile.id}
                  size="compact"
                  isCurrent={currentProfileId === profile.id}
                  defaultOpen={autoExpandCurrent && currentProfileId === profile.id}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
