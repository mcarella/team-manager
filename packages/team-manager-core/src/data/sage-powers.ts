import type { SagePowerId, SaboteurId } from '@team-manager/shared'

/** Canonical declaration order for the 5 Sage Powers (Positive Intelligence framework). */
export const ALL_SAGE_POWER_IDS: readonly SagePowerId[] = [
  'empathize',
  'explore',
  'innovate',
  'navigate',
  'activate',
] as const

export interface SagePower {
  id: SagePowerId
  /** Which saboteurs this sage power most directly counters. */
  countersSaboteurs: SaboteurId[]
  color: string
}

export const SAGE_POWERS: SagePower[] = [
  { id: 'empathize', countersSaboteurs: ['judge', 'pleaser', 'hyperAchiever', 'hyperRational', 'controller'], color: '#10b981' },
  { id: 'explore',   countersSaboteurs: ['hyperRational', 'restless', 'avoider'],                              color: '#3b82f6' },
  { id: 'innovate',  countersSaboteurs: ['stickler', 'controller', 'hyperVigilant'],                          color: '#8b5cf6' },
  { id: 'navigate',  countersSaboteurs: ['judge', 'stickler', 'hyperAchiever', 'hyperVigilant', 'controller'], color: '#f59e0b' },
  { id: 'activate',  countersSaboteurs: ['pleaser', 'victim', 'avoider'],                                      color: '#ec4899' },
]

export function getSagePower(id: SagePowerId): SagePower {
  const found = SAGE_POWERS.find(p => p.id === id)
  if (!found) throw new Error(`Unknown sage power id: ${id}`)
  return found
}
