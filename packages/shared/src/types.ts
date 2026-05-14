export type PermissionLevel = 'manager-led' | 'self-managing' | 'self-designing' | 'self-governing'

export interface User {
  id: string
  email: string
  name: string
  orgId: string
  role: 'manager' | 'member'
}

export interface Organization {
  id: string
  name: string
  permissionLevel: PermissionLevel
}

// Leadership Assessment

export interface LeadershipScores {
  catalyzing: number   // 2-20
  envisioning: number
  demanding: number
  coaching: number
  conducting: number
  directing: number
}

export type Archetype = 'expert' | 'coordinator' | 'peer' | 'coach' | 'strategist'

export type GolemansStyle = 'coercive' | 'authoritative' | 'pacesetting' | 'democratic' | 'coaching' | 'visionary'

export interface LeadershipAssessment {
  userId: string
  answers: number[] // [q1..q12], 1-10
  scores: LeadershipScores
  archetype: Archetype
  golemansStyles: GolemansStyle[] // Goleman's 6 leadership styles
  completedAt: Date
}

// Behavioral Core (Layer 2) — our own behavioral instrument, not PI.
// Source: docs/references/index/assessment-mock.jsx (86 adjectives, 2-pass) +
//         docs/references/index/archetypes-reference-guide.pdf (17 sub-profile centroids).

export interface BehavioralCoreFactors {
  dominance: number     // 0-100
  extraversion: number  // 0-100
  patience: number      // 0-100
  formality: number     // 0-100
}

// Goleman 6-style radar. Stores the full distribution under the hood —
// UI may project to a single dominant style. See DESIGN-Q: single-vs-distribution.
export type GolemanRadar = Record<GolemansStyle, number> // 0-100 per style

export type BehavioralCoreSubProfile =
  | 'ricercatore'   | 'direttore'    | 'esperto'
  | 'visionario'    | 'pioniere'     | 'armonizzatore'
  | 'capitano'      | 'mediatore'    | 'ribelle'
  | 'persuasore'    | 'ambasciatore' | 'camaleonte'
  | 'artigiano'     | 'guardiano'    | 'operatore'
  | 'individualista' | 'studioso'

// Binary selection per the reference instrument: the user PICKS adjectives that
// describe them in each pass. Selected = contributes its weight; unselected = 0.
export interface BehavioralCoreAnswers {
  selfConcept: string[] // adjective IDs picked for "how others expect you to be"
  self: string[]        // adjective IDs picked for "who you really are"
}

export interface BehavioralCoreAssessment {
  userId: string
  answers: BehavioralCoreAnswers
  selfConceptFactors: BehavioralCoreFactors // raw from pass 1
  selfFactors: BehavioralCoreFactors        // raw from pass 2
  factors: BehavioralCoreFactors            // synthesis: 0.6 * self + 0.4 * selfConcept
  golemanRadar: GolemanRadar
  subProfile: BehavioralCoreSubProfile
  completedAt: Date
}

// CVF Assessment

export interface CVFCategory {
  clan: number
  adhocracy: number
  market: number
  hierarchy: number
}

export interface CVFScores {
  clan: number
  adhocracy: number
  market: number
  hierarchy: number
}

export interface CVFAssessment {
  userId: string
  categories: CVFCategory[] // 6 categories × 4 values
  results: CVFScores        // sum per quadrant (0-600)
  completedAt: Date
}

// Skills Assessment

export type SkillLevel = 0 | 1 | 2 | 3 | 4

export interface Skill {
  id: string
  orgId: string
  name: string
  description?: string
}

export interface SkillRole {
  id: string
  name: string
  skills: { id: string; name: string }[]
}

export interface SkillAssessment {
  userId: string
  skillId: string
  level: SkillLevel
}

// Team

export interface TeamMemberProfile {
  user: User
  leadership?: LeadershipAssessment
  behavioralCore?: BehavioralCoreAssessment
  cvf?: CVFAssessment
  skills: SkillAssessment[]
}

export interface Team {
  id: string
  orgId: string
  name: string
  members: TeamMemberProfile[]
}

// Peer Skill Assessment (360° feedback)

export interface PeerSkillAssessment {
  assessorId: string
  subjectId: string
  skillId: string
  level: SkillLevel
  createdAt: Date
}

export interface PeerSkillSummary {
  subjectId: string
  skills: Record<string, { average: number; count: number }>
  totalEvaluators: number
}

// Peer Leadership Assessment (360° feedback)

export interface PeerLeadershipAssessment {
  assessorId: string
  subjectId: string
  answers: number[]   // [q1..q12], 1-10
  scores: LeadershipScores
  archetype: Archetype
  createdAt: Date
}

export interface PeerLeadershipSummary {
  subjectId: string
  behaviors: {
    catalyzing:  { average: number; count: number }
    envisioning: { average: number; count: number }
    demanding:   { average: number; count: number }
    coaching:    { average: number; count: number }
    conducting:  { average: number; count: number }
    directing:   { average: number; count: number }
  }
  archetypeCounts: Record<string, number>
  dominantArchetype: Archetype | null
  totalEvaluators: number
}

// Peer Behavioral Core Assessment (Layer 2 × 360° feedback)

export interface PeerBehavioralCoreAssessment {
  assessorId: string
  subjectId: string
  picks: string[] // adjective IDs the peer selected describing the subject (single pass, not Self-Concept + Self)
  factors: BehavioralCoreFactors
  subProfile: BehavioralCoreSubProfile
  createdAt: Date
}

export interface PeerBehavioralCoreSummary {
  subjectId: string
  totalEvaluators: number
  /** Frequency: adjectiveId → number of peers who picked it. */
  adjectiveFrequency: Record<string, number>
  /** Aggregated factors across peers (weighted by pick frequency, scaled 0-100). */
  factors: BehavioralCoreFactors
  /** Sub-profile match against the aggregated factors. */
  subProfile: BehavioralCoreSubProfile | null
  /** How many peers landed on each sub-profile individually (for diversity insight). */
  subProfileCounts: Record<string, number>
}

/** Enriched view of a single adjective's peer-pick frequency, for the heatmap render. */
export interface AdjectiveFrequency {
  adjectiveId: string
  count: number
  factor: 'dominance' | 'extraversion' | 'patience' | 'formality' | 'objectivity'
  /** Signed weight from the instrument (positive = high-factor, negative = low-factor). */
  weight: number
}

// Peer CVF Assessment (manager rating by team members)

export interface PeerCVFAssessment {
  assessorId: string
  subjectId: string
  categories: CVFCategory[]
  results: CVFScores
  createdAt: Date
}

export interface PeerCVFSummary {
  subjectId: string
  results: CVFScores        // averaged across evaluators
  totalEvaluators: number
}

// Profile Reliability (360° coverage)

export type ReliabilityStatus = 'reliable' | 'partial' | 'none'

export interface ProfileReliability {
  evaluators: number
  teamSize: number     // total members including self
  peers: number        // teamSize - 1
  coverage: number     // evaluators / peers (0–1), or 0 if no peers
  status: ReliabilityStatus
}

// Kiviat / Team Balance

export interface KiviatData {
  archetypeDistribution: Record<Archetype, number>
  cvfAverage: CVFScores
  skillsAverage: Record<string, number> // skillId → avg level
}

// Layer 3 — Saboteur Assessment

export type SaboteurId =
  | 'judge'
  | 'stickler'
  | 'pleaser'
  | 'hyperAchiever'
  | 'victim'
  | 'hyperRational'
  | 'hyperVigilant'
  | 'restless'
  | 'controller'
  | 'avoider'

export type SagePowerId = 'empathize' | 'explore' | 'innovate' | 'navigate' | 'activate'

export type LikertValue = 1 | 2 | 3 | 4 | 5

export type SaboteurScores = Record<SaboteurId, number> // each 0-10

export type PQLevel = 'critical' | 'mixed' | 'good' | 'excellent' | 'mastery'

export interface PQInterpretation {
  level: PQLevel
  /** Translation key for the headline label (e.g. 'layer3:pq.levels.excellent.label'). */
  labelKey: string
  /** Translation key for the body description. */
  descriptionKey: string
  /** Hex color hint for the gauge — UI may override via tokens. */
  color: string
}

export interface SaboteurAssessment {
  userId: string
  /** 50 answers in question-bank declaration order. Each 1-5. */
  saboteurAnswers: LikertValue[]
  /** 24 emotion pairs, each `{ pos: 1-5, neg: 1-5 }`. */
  pqAnswers: Array<{ pos: LikertValue; neg: LikertValue }>
  saboteurScores: SaboteurScores
  /** Sorted descending by score; ties broken by canonical declaration order. */
  rankedSaboteurs: SaboteurId[]
  /** Convenience: first 3 of rankedSaboteurs. */
  topSaboteurs: SaboteurId[]
  /** 0-100. */
  pqScore: number
  pqInterpretation: PQInterpretation
  /** Top 3 sage powers, frequency-weighted by topSaboteur antidotes (rank-weighted). */
  recommendedSagePowers: SagePowerId[]
  completedAt: Date
}
