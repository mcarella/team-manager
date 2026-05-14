// Layer 1 (ORGANIC Agility) leadership archetype reference data.
// Shared between the result card (ArchetypeCard) and the library gallery
// (OAArchetypesGallery).

import type { Archetype, GolemansStyle } from '@team-manager/shared'

export const ARCHETYPE_DESCRIPTIONS: Record<Archetype, string> = {
  expert:      'Drives results through deep expertise and high standards.',
  coordinator: 'Balances demanding pace with structured collaboration.',
  peer:        'Empowers the team through democratic facilitation.',
  coach:       'Develops people through guidance and catalyzing vision.',
  strategist:  'Shapes the future by inspiring systemic thinking.',
}

export interface ArchetypeProfile {
  roleLabel: string
  skills: { label: string; detail: string }[]
  characteristics: { label: string; detail: string }[]
}

export const ARCHETYPE_PROFILES: Record<Archetype, ArchetypeProfile> = {
  expert: {
    roleLabel: 'Expert',
    skills: [
      { label: 'Technical Expert',    detail: 'Deep domain knowledge enabling accurate problem assessment, solution design, and quality judgment. The Expert leader is often the go-to person for the hardest technical challenges.' },
      { label: 'Planner & Organizer', detail: 'Structures complex work into clear plans with defined milestones, dependencies, and responsibilities. Ensures the team knows what to do, when, and in what order.' },
      { label: 'Delegator',           detail: 'Assigns tasks based on individual capabilities and availability. Monitors delivery and provides guidance without doing the work themselves.' },
      { label: 'Controller',          detail: 'Maintains close oversight of execution to ensure standards, timelines, and quality are upheld. Spots deviations early and corrects them.' },
    ],
    characteristics: [
      { label: 'Controlling / Hierarchy', detail: 'Authority flows top-down. Decisions are made by the leader and communicated clearly downward. The chain of command is well defined and respected.' },
      { label: 'Individual Evaluation',   detail: "Each person's performance is assessed independently based on personal output, adherence to standards, and delivery of assigned tasks." },
      { label: 'Individual Reward',       detail: 'Recognition and compensation tied directly to individual contribution and personal achievement. High performers are identified and rewarded separately.' },
    ],
  },
  coordinator: {
    roleLabel: 'Co-ordinator',
    skills: [
      { label: 'Group Communication',  detail: 'Ensures information flows effectively across all team members and stakeholders. Runs clear meetings, creates shared context, and prevents information silos.' },
      { label: 'Problem Solver',       detail: 'Identifies root causes of issues and drives structured resolution. Brings the group together to diagnose problems and agree on the path forward.' },
      { label: 'Conflicts Resolution', detail: 'Steps in when tensions arise to mediate and restore productive collaboration. Addresses conflict directly rather than letting it fester.' },
      { label: 'Group Dynamic',        detail: 'Reads and actively shapes the energy and mood of the team. Knows when to push, when to ease off, and how to maintain cohesion under pressure.' },
    ],
    characteristics: [
      { label: 'Participative',         detail: 'Team members contribute opinions and ideas to decisions, while the Coordinator retains accountability for the final call.' },
      { label: 'Individual Evaluation', detail: "Each person's contribution is assessed independently. Performance conversations happen one-to-one." },
      { label: 'Individual Reward',     detail: 'Recognition and compensation reflect individual effort and results, even within a collaborative team context.' },
    ],
  },
  peer: {
    roleLabel: 'Enabler',
    skills: [
      { label: 'Facilitator',         detail: 'Creates the conditions for productive group discussion and shared decision-making. Ensures all voices are heard and the group reaches meaningful conclusions.' },
      { label: 'Enabler',             detail: 'Removes obstacles, secures resources, and clears the path so the team can self-organise and deliver without bottlenecks.' },
      { label: 'Conflict Resolution', detail: 'Addresses tensions through open dialogue, preserving psychological safety and enabling the team to process disagreement constructively.' },
    ],
    characteristics: [
      { label: 'Participative',                           detail: 'Decisions are made collectively, with full team involvement. The Peer leader participates as an equal, not a superior.' },
      { label: 'Collaborative (also in decision making)', detail: 'Collaboration extends beyond execution into strategy and direction. The team jointly owns outcomes, including key decisions.' },
      { label: 'Team Evaluation',                         detail: 'Performance is assessed as a collective. The team reflects on how it works together, not just what individuals produce.' },
      { label: 'Team Reward',                             detail: 'Recognition and compensation are shared equally across the team, reinforcing collective ownership.' },
    ],
  },
  coach: {
    roleLabel: 'Coach / Amplifier',
    skills: [
      { label: 'Coach',                                              detail: 'Uses powerful questions and reflection to help individuals grow and solve their own problems. Resists providing answers; instead builds capability.' },
      { label: 'Amplify team results',                              detail: 'Identifies what the team is already doing well and scales it. Removes friction, celebrates wins, and creates conditions for peak performance.' },
      { label: 'Benchmarking and help to self-measure and improve', detail: 'Introduces external reference points and metrics to help the team calibrate their performance and set meaningful stretch goals.' },
    ],
    characteristics: [
      { label: 'Collaborative',   detail: 'The leader participates as an equal in team discussions, contributing without dominating. Collaboration is the default mode.' },
      { label: 'Peer Evaluation', detail: "Team members assess each other's growth and contribution through structured peer feedback. The leader facilitates but does not own the evaluation." },
      { label: 'Team Reward',     detail: 'Outcomes and recognition are distributed across the whole team. Individual stars are celebrated as contributors to collective success.' },
    ],
  },
  strategist: {
    roleLabel: 'Catalyst',
    skills: [
      { label: 'Strategic Planner',     detail: "Translates long-term vision into a strategic roadmap connecting the team's daily work to organisational goals. Thinks in systems and trends, not just tasks." },
      { label: 'Catalyze team outcome', detail: 'Amplifies team impact by connecting them with the broader organisation, removing systemic obstacles, and creating conditions for emergent results.' },
    ],
    characteristics: [
      { label: 'Empowered',        detail: 'The team has full autonomy over both execution and goal setting. Leadership is distributed and self-governing.' },
      { label: 'Peer Evaluation',  detail: 'Mutual assessment within the team, without hierarchical oversight. Everyone is accountable to each other.' },
      { label: 'Team Reward',      detail: 'Collective recognition tied to shared outcomes. The team succeeds or learns together.' },
      { label: 'Team Recruitment', detail: 'The team participates in selecting new members, ensuring cultural fit, complementary skills, and shared values.' },
    ],
  },
}

export const HACKMAN_LEVELS: Record<Archetype, string> = {
  expert:      'Manager-led',
  coordinator: 'Manager-led / Self-managing',
  peer:        'Self-managing',
  coach:       'Self-designing',
  strategist:  'Self-governing',
}

// Primary + secondary Goleman style per archetype (matches BEHAVIOR_TO_GOLEMAN
// mapping in `packages/team-manager-core/src/leadership.ts`).
export const ARCHETYPE_GOLEMAN_PAIR: Record<Archetype, [GolemansStyle, GolemansStyle]> = {
  expert:      ['coercive',      'pacesetting'],
  coordinator: ['pacesetting',   'democratic'],
  peer:        ['democratic',    'coaching'],
  coach:       ['coaching',      'visionary'],
  strategist:  ['visionary',     'coaching'],
}

// Primary + secondary ORGANIC behavior per archetype (mirrors the above).
// Title-cased to match the KiviatChart axis labels rendered on Behavior Scores.
export const ARCHETYPE_BEHAVIOR_PAIR: Record<Archetype, [string, string]> = {
  expert:      ['Directing',  'Demanding'],
  coordinator: ['Demanding',  'Conducting'],
  peer:        ['Conducting', 'Coaching'],
  coach:       ['Coaching',   'Catalyzing'],
  strategist:  ['Catalyzing', 'Coaching'],
}

// Ordered list used by the gallery. Follows OA's maturity progression
// (manager-led → self-governing).
export const ARCHETYPE_ORDER: Archetype[] = ['expert', 'coordinator', 'peer', 'coach', 'strategist']
