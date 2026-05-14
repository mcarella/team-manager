import type { SaboteurId, SagePowerId } from '@team-manager/shared'

/**
 * Canonical declaration order — used to break ranking ties and to ensure stable
 * output across the app. Matches the order in `docs/ideas/saboteur-implementation-plan.md`.
 */
export const ALL_SABOTEUR_IDS: readonly SaboteurId[] = [
  'judge',
  'stickler',
  'pleaser',
  'hyperAchiever',
  'victim',
  'hyperRational',
  'hyperVigilant',
  'restless',
  'controller',
  'avoider',
] as const

/**
 * Static reference for each of the 10 saboteurs.
 * - `sageAntidotes` — ordered list of sage powers that counter this saboteur (most relevant first).
 * - `isUniversal` — only `judge` is universal (Shirzad Chamine / Positive Intelligence framework).
 * - Color hint for radar / cards — UI may override via tokens.
 *
 * User-facing text (name, motto, origin, hijackedStrength, sageAntidote copy,
 * thoughts/feelings examples, survivalOrigin, interceptTip) lives in
 * `apps/web/src/locales/en/layer3.json` under `saboteurs.<id>.*`.
 */
export interface SaboteurProfile {
  id: SaboteurId
  sageAntidotes: SagePowerId[]
  isUniversal: boolean
  color: string
}

export const SABOTEUR_PROFILES: SaboteurProfile[] = [
  { id: 'judge',          sageAntidotes: ['empathize', 'navigate'], isUniversal: true,  color: '#1f2937' },
  { id: 'stickler',       sageAntidotes: ['empathize', 'navigate'], isUniversal: false, color: '#7c3aed' },
  { id: 'pleaser',        sageAntidotes: ['empathize', 'activate'], isUniversal: false, color: '#ec4899' },
  { id: 'hyperAchiever',  sageAntidotes: ['empathize', 'navigate'], isUniversal: false, color: '#f59e0b' },
  { id: 'victim',         sageAntidotes: ['activate',  'empathize'], isUniversal: false, color: '#64748b' },
  { id: 'hyperRational',  sageAntidotes: ['empathize', 'explore'],  isUniversal: false, color: '#3b82f6' },
  { id: 'hyperVigilant',  sageAntidotes: ['navigate',  'empathize'], isUniversal: false, color: '#dc2626' },
  { id: 'restless',       sageAntidotes: ['explore',   'navigate'], isUniversal: false, color: '#10b981' },
  { id: 'controller',     sageAntidotes: ['empathize', 'navigate'], isUniversal: false, color: '#ef4444' },
  { id: 'avoider',        sageAntidotes: ['activate',  'empathize'], isUniversal: false, color: '#a855f7' },
]

export function getSaboteurProfile(id: SaboteurId): SaboteurProfile {
  const found = SABOTEUR_PROFILES.find(p => p.id === id)
  if (!found) throw new Error(`Unknown saboteur id: ${id}`)
  return found
}
