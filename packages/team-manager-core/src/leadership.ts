import type { LeadershipScores, Archetype, GolemansStyle } from '@team-manager/shared'

// Pair sums: q1+q11, q2+q9, q3+q12, q4+q10, q5+q7, q6+q8 (1-indexed → 0-indexed)
const PAIRS: Record<keyof LeadershipScores, [number, number]> = {
  catalyzing:  [0, 10],
  envisioning: [1, 8],
  demanding:   [2, 11],
  coaching:    [3, 9],
  conducting:  [4, 6],
  directing:   [5, 7],
}

// Archetype primary behavior pairs (ordered: primary, secondary)
const ARCHETYPE_BEHAVIORS: Record<Archetype, [keyof LeadershipScores, keyof LeadershipScores]> = {
  expert:      ['directing',  'demanding'],
  coordinator: ['demanding',  'conducting'],
  peer:        ['conducting', 'coaching'],
  coach:       ['coaching',   'catalyzing'],
  strategist:  ['catalyzing', 'coaching'],
}

// Behavior → Goleman style mapping
const BEHAVIOR_TO_GOLEMAN: Record<keyof LeadershipScores, GolemansStyle> = {
  directing:  'coercive',
  envisioning: 'authoritative',
  demanding:  'pacesetting',
  conducting: 'democratic',
  coaching:   'coaching',
  catalyzing: 'visionary',
}

export function computeLeadershipScores(answers: number[]): LeadershipScores {
  if (answers.length !== 12) {
    throw new Error(`Expected 12 answers, got ${answers.length}`)
  }
  for (const a of answers) {
    if (a < 1 || a > 10) {
      throw new Error(`Answer out of range 1-10: ${a}`)
    }
  }

  const scores = {} as LeadershipScores
  for (const [behavior, [i, j]] of Object.entries(PAIRS) as [keyof LeadershipScores, [number, number]][]) {
    scores[behavior] = answers[i]! + answers[j]!
  }
  return scores
}

export function computeArchetype(scores: LeadershipScores): Archetype {
  // Combined score per archetype = sum of its two primary behaviors
  const archetypeScores = Object.entries(ARCHETYPE_BEHAVIORS).map(([archetype, [primary, secondary]]) => ({
    archetype: archetype as Archetype,
    combined: scores[primary] + scores[secondary],
    primary: scores[primary],
  }))

  // Sort: highest combined first; for equal combined, higher primary wins;
  // for equal primary too, preserve order (coach before strategist)
  archetypeScores.sort((a, b) => b.combined - a.combined || b.primary - a.primary)

  return archetypeScores[0]!.archetype
}

export function computeGolemansStyles(archetype: Archetype): GolemansStyle[] {
  const [primary, secondary] = ARCHETYPE_BEHAVIORS[archetype]
  return [BEHAVIOR_TO_GOLEMAN[primary], BEHAVIOR_TO_GOLEMAN[secondary]]
}

// Behavior aliases for the progression API. Keep aligned with LeadershipScores keys.
export type Behavior = keyof LeadershipScores

export interface ArchetypeProgression {
  next: Archetype
  /** Behavior to dampen — currently primary, to be reduced. */
  dampen: Behavior
  /** Behavior to amplify — currently secondary or absent, to be increased. */
  amplify: Behavior
}

/**
 * Natural archetype progression sequence: expert → coordinator → peer → coach → strategist.
 * For each step, returns which behavior to dampen and which to amplify in order
 * to shift the primary into the next archetype's signature pair.
 *
 * Returns `null` for `strategist` (peak of the natural sequence — no further step).
 */
export function getArchetypeProgression(current: Archetype): ArchetypeProgression | null {
  switch (current) {
    case 'expert':      return { next: 'coordinator', dampen: 'directing',  amplify: 'demanding'   }
    case 'coordinator': return { next: 'peer',        dampen: 'demanding',  amplify: 'conducting'  }
    case 'peer':        return { next: 'coach',       dampen: 'conducting', amplify: 'coaching'    }
    case 'coach':       return { next: 'strategist',  dampen: 'coaching',   amplify: 'catalyzing'  }
    case 'strategist':  return null
  }
}
