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
