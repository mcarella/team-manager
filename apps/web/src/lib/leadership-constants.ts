export const BEHAVIOR_LABELS: Record<string, string> = {
  catalyzing: 'Catalyzing', envisioning: 'Envisioning', demanding: 'Demanding',
  coaching: 'Coaching', conducting: 'Conducting', directing: 'Directing',
}

export const GOLEMAN_MOTTOS: Record<string, string> = {
  catalyzing: '"See the whole picture"', envisioning: '"Come with me"',
  demanding: '"Do as I do, now"', coaching: '"Try this"',
  conducting: '"What do you think?"', directing: '"Do what I tell you"',
}

export const GOLEMAN_STYLE_MOTTOS: Record<string, string> = {
  coercive: '"Do what I tell you"',
  authoritative: '"Come with me"',
  pacesetting: '"Do as I do, now"',
  democratic: '"What do you think?"',
  coaching: '"Try this"',
  visionary: '"See the whole picture"',
}

// Goleman style → matching ORGANIC behavior (lowercase, for the triad convention).
// Used to render double-labeled radar axes: Goleman style on top, OA behavior below.
export const GOLEMAN_TO_BEHAVIOR_LABEL: Record<string, string> = {
  coercive:      'directing',
  authoritative: 'envisioning',
  pacesetting:   'demanding',
  democratic:    'conducting',
  coaching:      'coaching',
  visionary:     'catalyzing',
}

// Detailed Goleman-style behavior table. Used by both Layer 1 (ArchetypeCard)
// and Layer 2 (BehavioralCoreResultCard) to render the deep-dive table.
import type { GolemansStyle } from '@team-manager/shared'

export interface BehaviorDetail {
  label: string
  leaderAttitude: string
  leaderStance: string
  workManagement: string
  definitionOfSuccess: string
  motivationalStyle: string
  groupUnity: string
}

export const BEHAVIOR_DETAILS: Record<GolemansStyle, BehaviorDetail> = {
  visionary: {
    label: 'Catalyzing',
    leaderAttitude: 'You can do even better',
    leaderStance: 'Leader is challenger',
    workManagement: 'Self governing, purpose-driven',
    definitionOfSuccess: 'Open-minded independence',
    motivationalStyle: 'Awareness of the impact the team has on the rest of the organization, market... world',
    groupUnity: 'Proactively looking for new challenges, trust in the team and accountability are very high',
  },
  authoritative: {
    label: 'Envisioning',
    leaderAttitude: 'We can do this together',
    leaderStance: 'Leader is enabler',
    workManagement: 'Collaboratively agreed',
    definitionOfSuccess: 'Collaboration',
    motivationalStyle: 'Shared responsibility creates safety and collective sense of belonging',
    groupUnity: 'The team identity and the shared inspiring and appealing purpose hold the group together',
  },
  pacesetting: {
    label: 'Demanding',
    leaderAttitude: 'I expect you to meet my standards',
    leaderStance: 'Leader sets the bar',
    workManagement: 'Assigns targets to individuals',
    definitionOfSuccess: 'Meeting targets',
    motivationalStyle: 'Patronage and individual incentives',
    groupUnity: "Realistic and achievable targets. Leader's capability to resolve conflicts",
  },
  coaching: {
    label: 'Coaching',
    leaderAttitude: 'You can do this without me',
    leaderStance: 'Leader is servant',
    workManagement: 'Self-directed',
    definitionOfSuccess: 'Autonomy',
    motivationalStyle: 'Proud to be part of the tribe, profound trust in the team and their potential',
    groupUnity: 'Team are aware of their potential and are able to master their own destiny',
  },
  democratic: {
    label: 'Conducting',
    leaderAttitude: 'I encourage you to work together while meeting your targets',
    leaderStance: 'Leader is organizer',
    workManagement: 'Coordinates work between individuals',
    definitionOfSuccess: 'Cooperation',
    motivationalStyle: 'Opportunity to manage my own work and seek support from people I trust within the team',
    groupUnity: 'Clarity of roles within the team and development of group dynamics towards team identity',
  },
  coercive: {
    label: 'Directing',
    leaderAttitude: 'This is exactly what I want, how and when',
    leaderStance: 'Leader is authority',
    workManagement: 'Assigns work to individuals',
    definitionOfSuccess: 'Full compliance',
    motivationalStyle: "Threat of non compliance, failure isn't an option",
    groupUnity: 'Direct relationship to leader who holds the group together. Absolute clarity about what needs to be done and how',
  },
}

export const BEHAVIOR_PAIRS = [
  'catalyzing', 'envisioning', 'demanding', 'coaching', 'conducting', 'directing',
] as const

export function thirdPersonQuestions(name: string): string[] {
  return [
    `${name} is good at encouraging teams to challenge their assumptions and break through to new levels of performance`,
    `${name} is good at getting people on board, motivating them towards compelling strategic goals`,
    `${name} believes in modeling desired behaviors and expecting others to follow their lead`,
    `${name} believes that their solution is never going to be as effective as one their people come up with by themselves`,
    `${name} encourages people to work together while making sure they are meeting their targets`,
    `${name} ensures high quality by being very clear about what they expect of people`,
    `${name} makes sure that individuals can get access to the people and resources they need to do their jobs`,
    `${name} makes sure the right work is always allocated to the right people`,
    `${name} shares goals to reach for, rather than tasks to complete`,
    `${name} prioritizes long-term individual and team growth over short-term results`,
    `${name} takes a back seat from active team leadership and instead supports the team to govern themselves`,
    `${name} delegates tasks but reserves the right to resume control if people are not performing adequately`,
  ]
}
