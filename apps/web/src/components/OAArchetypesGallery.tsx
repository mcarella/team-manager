import type { Archetype } from '@team-manager/shared'
import { ARCHETYPE_ORDER } from '../lib/archetype-profiles.js'
import OAArchetypeCard from './OAArchetypeCard.js'

interface Props {
  currentArchetype?: Archetype
  autoExpandCurrent?: boolean
}

export default function OAArchetypesGallery({ currentArchetype, autoExpandCurrent = false }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ARCHETYPE_ORDER.map(archetype => (
        <OAArchetypeCard
          key={archetype}
          archetype={archetype}
          size="compact"
          isCurrent={currentArchetype === archetype}
          defaultOpen={autoExpandCurrent && currentArchetype === archetype}
        />
      ))}
    </div>
  )
}
