import type { SaboteurId } from '@team-manager/shared'

/**
 * Question-bank metadata for the Saboteur Assessment.
 *
 * Structural data (id, saboteurId, weight, reverseScored) lives here so the
 * scoring engine has a stable source of truth. User-facing question text lives
 * in `apps/web/src/locales/en/layer3.json` keyed by `questions.<id>` so the
 * instrument can be translated without touching scoring code.
 *
 * Source: `docs/ideas/saboteur-implementation-plan.md` § 3.1 (50 items mapped
 * across 10 saboteurs: Judge=8, Stickler=5, Pleaser=5, HyperAchiever=5,
 * Victim=4, HyperRational=4, HyperVigilant=5, Restless=4, Controller=5, Avoider=5).
 */
export interface SaboteurQuestion {
  id: string
  saboteurId: SaboteurId
  reverseScored: boolean
  weight: number
}

export const SABOTEUR_QUESTIONS: readonly SaboteurQuestion[] = [
  // Judge (8)
  { id: 'sab_j01', saboteurId: 'judge', reverseScored: false, weight: 1.0 },
  { id: 'sab_j02', saboteurId: 'judge', reverseScored: false, weight: 1.0 },
  { id: 'sab_j03', saboteurId: 'judge', reverseScored: false, weight: 0.9 },
  { id: 'sab_j04', saboteurId: 'judge', reverseScored: false, weight: 1.0 },
  { id: 'sab_j05', saboteurId: 'judge', reverseScored: false, weight: 1.0 },
  { id: 'sab_j06', saboteurId: 'judge', reverseScored: false, weight: 0.9 },
  { id: 'sab_j07', saboteurId: 'judge', reverseScored: false, weight: 1.0 },
  { id: 'sab_j08', saboteurId: 'judge', reverseScored: false, weight: 1.0 },

  // Stickler (5)
  { id: 'sab_s01', saboteurId: 'stickler', reverseScored: false, weight: 1.0 },
  { id: 'sab_s02', saboteurId: 'stickler', reverseScored: false, weight: 1.0 },
  { id: 'sab_s03', saboteurId: 'stickler', reverseScored: false, weight: 1.0 },
  { id: 'sab_s04', saboteurId: 'stickler', reverseScored: false, weight: 0.9 },
  { id: 'sab_s05', saboteurId: 'stickler', reverseScored: false, weight: 1.1 },

  // Pleaser (5)
  { id: 'sab_p01', saboteurId: 'pleaser', reverseScored: false, weight: 1.0 },
  { id: 'sab_p02', saboteurId: 'pleaser', reverseScored: false, weight: 1.0 },
  { id: 'sab_p03', saboteurId: 'pleaser', reverseScored: false, weight: 1.0 },
  { id: 'sab_p04', saboteurId: 'pleaser', reverseScored: false, weight: 1.0 },
  { id: 'sab_p05', saboteurId: 'pleaser', reverseScored: false, weight: 0.9 },

  // Hyper-Achiever (5)
  { id: 'sab_ha01', saboteurId: 'hyperAchiever', reverseScored: false, weight: 1.0 },
  { id: 'sab_ha02', saboteurId: 'hyperAchiever', reverseScored: false, weight: 1.0 },
  { id: 'sab_ha03', saboteurId: 'hyperAchiever', reverseScored: false, weight: 1.0 },
  { id: 'sab_ha04', saboteurId: 'hyperAchiever', reverseScored: false, weight: 0.9 },
  { id: 'sab_ha05', saboteurId: 'hyperAchiever', reverseScored: false, weight: 1.1 },

  // Victim (4)
  { id: 'sab_v01', saboteurId: 'victim', reverseScored: false, weight: 1.0 },
  { id: 'sab_v02', saboteurId: 'victim', reverseScored: false, weight: 1.0 },
  { id: 'sab_v03', saboteurId: 'victim', reverseScored: false, weight: 1.1 },
  { id: 'sab_v04', saboteurId: 'victim', reverseScored: false, weight: 1.0 },

  // Hyper-Rational (4)
  { id: 'sab_hr01', saboteurId: 'hyperRational', reverseScored: false, weight: 1.0 },
  { id: 'sab_hr02', saboteurId: 'hyperRational', reverseScored: false, weight: 1.0 },
  { id: 'sab_hr03', saboteurId: 'hyperRational', reverseScored: false, weight: 1.0 },
  { id: 'sab_hr04', saboteurId: 'hyperRational', reverseScored: false, weight: 1.1 },

  // Hyper-Vigilant (5)
  { id: 'sab_hv01', saboteurId: 'hyperVigilant', reverseScored: false, weight: 1.0 },
  { id: 'sab_hv02', saboteurId: 'hyperVigilant', reverseScored: false, weight: 1.0 },
  { id: 'sab_hv03', saboteurId: 'hyperVigilant', reverseScored: false, weight: 0.9 },
  { id: 'sab_hv04', saboteurId: 'hyperVigilant', reverseScored: false, weight: 1.1 },
  { id: 'sab_hv05', saboteurId: 'hyperVigilant', reverseScored: false, weight: 1.0 },

  // Restless (4)
  { id: 'sab_r01', saboteurId: 'restless', reverseScored: false, weight: 1.0 },
  { id: 'sab_r02', saboteurId: 'restless', reverseScored: false, weight: 1.0 },
  { id: 'sab_r03', saboteurId: 'restless', reverseScored: false, weight: 1.0 },
  { id: 'sab_r04', saboteurId: 'restless', reverseScored: false, weight: 1.0 },

  // Controller (5)
  { id: 'sab_c01', saboteurId: 'controller', reverseScored: false, weight: 1.0 },
  { id: 'sab_c02', saboteurId: 'controller', reverseScored: false, weight: 1.0 },
  { id: 'sab_c03', saboteurId: 'controller', reverseScored: false, weight: 1.0 },
  { id: 'sab_c04', saboteurId: 'controller', reverseScored: false, weight: 0.9 },
  { id: 'sab_c05', saboteurId: 'controller', reverseScored: false, weight: 1.0 },

  // Avoider (5)
  { id: 'sab_a01', saboteurId: 'avoider', reverseScored: false, weight: 1.0 },
  { id: 'sab_a02', saboteurId: 'avoider', reverseScored: false, weight: 1.0 },
  { id: 'sab_a03', saboteurId: 'avoider', reverseScored: false, weight: 1.0 },
  { id: 'sab_a04', saboteurId: 'avoider', reverseScored: false, weight: 0.9 },
  { id: 'sab_a05', saboteurId: 'avoider', reverseScored: false, weight: 1.1 },
]

/** 24 PQ emotion pairs — structural id list. Text in `locales/en/layer3.json` under `pqPairs.<id>.*`. */
export interface PQPair {
  id: string
}

export const PQ_EMOTION_PAIRS: readonly PQPair[] = Array.from(
  { length: 24 },
  (_, i) => ({ id: `pq${String(i + 1).padStart(2, '0')}` }),
)
