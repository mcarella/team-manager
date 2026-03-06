import { useState } from 'react'
import type { LeadershipAssessment, Archetype, GolemansStyle } from '@team-manager/shared'

interface BehaviorDetail {
  label: string
  leaderAttitude: string
  leaderStance: string
  workManagement: string
  definitionOfSuccess: string
  motivationalStyle: string
  groupUnity: string
}

const BEHAVIOR_DETAILS: Record<GolemansStyle, BehaviorDetail> = {
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

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  expert:      'Drives results through deep expertise and high standards.',
  coordinator: 'Balances demanding pace with structured collaboration.',
  peer:        'Empowers the team through democratic facilitation.',
  coach:       'Develops people through guidance and catalyzing vision.',
  strategist:  'Shapes the future by inspiring systemic thinking.',
}

interface Item {
  label: string
  detail: string
}

interface ArchetypeProfile {
  roleLabel: string
  skills: Item[]
  characteristics: Item[]
}

const ARCHETYPE_PROFILES: Record<Archetype, ArchetypeProfile> = {
  expert: {
    roleLabel: 'Expert',
    skills: [
      { label: 'Technical Expert',       detail: 'Deep domain knowledge enabling accurate problem assessment, solution design, and quality judgment. The Expert leader is often the go-to person for the hardest technical challenges.' },
      { label: 'Planner & Organizer',    detail: 'Structures complex work into clear plans with defined milestones, dependencies, and responsibilities. Ensures the team knows what to do, when, and in what order.' },
      { label: 'Delegator',              detail: 'Assigns tasks based on individual capabilities and availability. Monitors delivery and provides guidance without doing the work themselves.' },
      { label: 'Controller',             detail: 'Maintains close oversight of execution to ensure standards, timelines, and quality are upheld. Spots deviations early and corrects them.' },
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
      { label: 'Group Communication',   detail: 'Ensures information flows effectively across all team members and stakeholders. Runs clear meetings, creates shared context, and prevents information silos.' },
      { label: 'Problem Solver',        detail: 'Identifies root causes of issues and drives structured resolution. Brings the group together to diagnose problems and agree on the path forward.' },
      { label: 'Conflicts Resolution',  detail: 'Steps in when tensions arise to mediate and restore productive collaboration. Addresses conflict directly rather than letting it fester.' },
      { label: 'Group Dynamic',         detail: 'Reads and actively shapes the energy and mood of the team. Knows when to push, when to ease off, and how to maintain cohesion under pressure.' },
    ],
    characteristics: [
      { label: 'Participative',          detail: 'Team members contribute opinions and ideas to decisions, while the Coordinator retains accountability for the final call.' },
      { label: 'Individual Evaluation',  detail: "Each person's contribution is assessed independently. Performance conversations happen one-to-one." },
      { label: 'Individual Reward',      detail: 'Recognition and compensation reflect individual effort and results, even within a collaborative team context.' },
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
      { label: 'Participative',                            detail: 'Decisions are made collectively, with full team involvement. The Peer leader participates as an equal, not a superior.' },
      { label: 'Collaborative (also in decision making)', detail: 'Collaboration extends beyond execution into strategy and direction. The team jointly owns outcomes, including key decisions.' },
      { label: 'Team Evaluation',                         detail: 'Performance is assessed as a collective. The team reflects on how it works together, not just what individuals produce.' },
      { label: 'Team Reward',                             detail: 'Recognition and compensation are shared equally across the team, reinforcing collective ownership.' },
    ],
  },
  coach: {
    roleLabel: 'Coach / Amplifier',
    skills: [
      { label: 'Coach',                                          detail: 'Uses powerful questions and reflection to help individuals grow and solve their own problems. Resists providing answers; instead builds capability.' },
      { label: 'Amplify team results',                          detail: 'Identifies what the team is already doing well and scales it. Removes friction, celebrates wins, and creates conditions for peak performance.' },
      { label: 'Benchmarking and help to self-measure and improve', detail: 'Introduces external reference points and metrics to help the team calibrate their performance and set meaningful stretch goals.' },
    ],
    characteristics: [
      { label: 'Collaborative',      detail: 'The leader participates as an equal in team discussions, contributing without dominating. Collaboration is the default mode.' },
      { label: 'Peer Evaluation',    detail: 'Team members assess each other\'s growth and contribution through structured peer feedback. The leader facilitates but does not own the evaluation.' },
      { label: 'Team Reward',        detail: 'Outcomes and recognition are distributed across the whole team. Individual stars are celebrated as contributors to collective success.' },
    ],
  },
  strategist: {
    roleLabel: 'Catalyst',
    skills: [
      { label: 'Strategic Planner',      detail: 'Translates long-term vision into a strategic roadmap connecting the team\'s daily work to organisational goals. Thinks in systems and trends, not just tasks.' },
      { label: 'Catalyze team outcome',  detail: 'Amplifies team impact by connecting them with the broader organisation, removing systemic obstacles, and creating conditions for emergent results.' },
    ],
    characteristics: [
      { label: 'Empowered',          detail: 'The team has full autonomy over both execution and goal setting. Leadership is distributed and self-governing.' },
      { label: 'Peer Evaluation',    detail: 'Mutual assessment within the team, without hierarchical oversight. Everyone is accountable to each other.' },
      { label: 'Team Reward',        detail: 'Collective recognition tied to shared outcomes. The team succeeds or learns together.' },
      { label: 'Team Recruitment',   detail: 'The team participates in selecting new members, ensuring cultural fit, complementary skills, and shared values.' },
    ],
  },
}

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-800',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-800',
  peer:        'bg-blue-50 border-blue-200 text-blue-800',
  coach:       'bg-green-50 border-green-200 text-green-800',
  strategist:  'bg-purple-50 border-purple-200 text-purple-800',
}

function ExpandableItem({ label, detail }: Item) {
  const [open, setOpen] = useState(false)
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex items-start gap-2 w-full text-left group"
      >
        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
        <span className="text-sm flex-1">{label}</span>
        <span className="text-xs opacity-40 group-hover:opacity-70 shrink-0 mt-0.5">
          {open ? '▲' : '▼'}
        </span>
      </button>
      {open && (
        <p className="mt-1.5 ml-3.5 text-xs opacity-70 leading-relaxed border-l-2 border-current/20 pl-3">
          {detail}
        </p>
      )}
    </li>
  )
}

interface Props {
  assessment: LeadershipAssessment
}

export default function ArchetypeCard({ assessment }: Props) {
  const { archetype, scores, golemansStyles } = assessment
  const colorClass = ARCHETYPE_COLORS[archetype] ?? 'bg-gray-50 border-gray-200 text-gray-800'
  const profile = ARCHETYPE_PROFILES[archetype]

  return (
    <div className={`w-full max-w-lg rounded-2xl border-2 p-6 space-y-5 ${colorClass}`}>
      {/* Header */}
      <div>
        <p className="text-sm font-medium uppercase tracking-widest opacity-60">Your Archetype</p>
        <h2 className="text-3xl font-bold capitalize">{archetype}</h2>
        <p className="text-xs font-medium opacity-50 mt-0.5">{profile.roleLabel}</p>
        <p className="mt-1 text-sm opacity-80">{ARCHETYPE_DESCRIPTIONS[archetype]}</p>
      </div>

      {/* Leader's Skills */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Leader's Skills</p>
        <ul className="space-y-2">
          {profile.skills.map(item => <ExpandableItem key={item.label} {...item} />)}
        </ul>
      </div>

      {/* Characteristics */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Characteristics</p>
        <ul className="space-y-2">
          {profile.characteristics.map(item => <ExpandableItem key={item.label} {...item} />)}
        </ul>
      </div>

      {/* Behavior Scores */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Behavior Scores</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(scores).map(([behavior, score]) => (
            <div key={behavior} className="flex items-center justify-between bg-white/50 rounded-lg px-3 py-1.5">
              <span className="text-sm capitalize">{behavior}</span>
              <span className="font-bold text-sm">{score}/20</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goleman Behavior Deep-Dive */}
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Leadership Styles — Attitudes & Behaviors</p>
        {golemansStyles.map(style => {
          const d = BEHAVIOR_DETAILS[style]
          return (
            <div key={style} className="bg-white/50 rounded-xl p-4 space-y-2">
              <p className="font-bold capitalize text-sm">{d.label} <span className="font-normal opacity-50 text-xs">({style})</span></p>
              <table className="w-full text-xs border-separate border-spacing-y-1">
                <tbody>
                  {[
                    ['Leader Attitude',        d.leaderAttitude],
                    ['Leader Stance',          d.leaderStance],
                    ['Work Management',        d.workManagement],
                    ['Definition of Success',  d.definitionOfSuccess],
                    ['Motivational Style',     d.motivationalStyle],
                    ['Group Unity',            d.groupUnity],
                  ].map(([label, value]) => (
                    <tr key={label}>
                      <td className="font-semibold opacity-60 pr-3 whitespace-nowrap align-top w-32">{label}</td>
                      <td className="opacity-90">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })}
      </div>
    </div>
  )
}
