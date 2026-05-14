// 17 sub-profile centroids. Lifted from docs/references/index/assessment-mock.jsx
// lines 110-128 (also matches docs/references/index/archetypes-reference-guide.pdf).
// Each centroid is a point in 4-factor space (0-100 per axis).
// User-facing names, descriptions, strengths, cautions live in
// apps/web/src/locales/*/sub-profiles.json (TBD T8).

import type { BehavioralCoreFactors, BehavioralCoreSubProfile } from '@team-manager/shared'

export type SubProfileGroup = 'analytical' | 'social' | 'stabilizing' | 'persistent'

export interface SubProfileCentroid {
  id: BehavioralCoreSubProfile
  centroid: BehavioralCoreFactors
  group: SubProfileGroup
}

export const SUB_PROFILES: SubProfileCentroid[] = [
  // Analytical
  { id: 'ricercatore',    group: 'analytical',  centroid: { dominance: 55, extraversion: 25, patience: 25, formality: 80 } },
  { id: 'direttore',      group: 'analytical',  centroid: { dominance: 80, extraversion: 20, patience: 20, formality: 80 } },
  { id: 'esperto',        group: 'analytical',  centroid: { dominance: 50, extraversion: 25, patience: 60, formality: 80 } },
  { id: 'visionario',     group: 'analytical',  centroid: { dominance: 80, extraversion: 50, patience: 20, formality: 75 } },
  { id: 'pioniere',       group: 'analytical',  centroid: { dominance: 85, extraversion: 25, patience: 15, formality: 25 } },
  // Social
  { id: 'armonizzatore',  group: 'social',      centroid: { dominance: 30, extraversion: 75, patience: 55, formality: 55 } },
  { id: 'capitano',       group: 'social',      centroid: { dominance: 80, extraversion: 80, patience: 20, formality: 30 } },
  { id: 'mediatore',      group: 'social',      centroid: { dominance: 30, extraversion: 75, patience: 70, formality: 30 } },
  { id: 'ribelle',        group: 'social',      centroid: { dominance: 85, extraversion: 80, patience: 15, formality: 20 } },
  { id: 'persuasore',     group: 'social',      centroid: { dominance: 75, extraversion: 85, patience: 20, formality: 45 } },
  { id: 'ambasciatore',   group: 'social',      centroid: { dominance: 50, extraversion: 80, patience: 25, formality: 25 } },
  // Stabilizing
  { id: 'camaleonte',     group: 'stabilizing', centroid: { dominance: 50, extraversion: 50, patience: 50, formality: 50 } },
  { id: 'artigiano',      group: 'stabilizing', centroid: { dominance: 25, extraversion: 20, patience: 75, formality: 80 } },
  { id: 'guardiano',      group: 'stabilizing', centroid: { dominance: 20, extraversion: 25, patience: 80, formality: 85 } },
  { id: 'operatore',      group: 'stabilizing', centroid: { dominance: 25, extraversion: 25, patience: 80, formality: 25 } },
  // Persistent
  { id: 'individualista', group: 'persistent',  centroid: { dominance: 80, extraversion: 20, patience: 70, formality: 80 } },
  { id: 'studioso',       group: 'persistent',  centroid: { dominance: 75, extraversion: 20, patience: 50, formality: 80 } },
]
