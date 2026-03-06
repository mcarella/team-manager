import type { LeadershipAssessment, Archetype } from '@team-manager/shared'

const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  expert:      'Drives results through deep expertise and high standards.',
  coordinator: 'Balances demanding pace with structured collaboration.',
  peer:        'Empowers the team through democratic facilitation.',
  coach:       'Develops people through guidance and catalyzing vision.',
  strategist:  'Shapes the future by inspiring systemic thinking.',
}

interface ArchetypeProfile {
  skills: string[]
  characteristics: string[]
  roleLabel: string
}

const ARCHETYPE_PROFILES: Record<Archetype, ArchetypeProfile> = {
  expert: {
    roleLabel: 'Expert',
    skills: ['Technical Expert', 'Planner & Organizer', 'Delegator', 'Controller'],
    characteristics: ['Controlling / Hierarchy', 'Individual Evaluation', 'Individual Reward'],
  },
  coordinator: {
    roleLabel: 'Co-ordinator',
    skills: ['Group Communication', 'Problem Solver', 'Conflicts Resolution', 'Group Dynamic'],
    characteristics: ['Participative', 'Individual Evaluation', 'Individual Reward'],
  },
  peer: {
    roleLabel: 'Enabler',
    skills: ['Facilitator', 'Enabler', 'Conflict Resolution'],
    characteristics: ['Participative', 'Collaborative (also in decision making)', 'Team Evaluation', 'Team Reward'],
  },
  coach: {
    roleLabel: 'Coach / Amplifier',
    skills: ['Coach', 'Amplify team results', 'Benchmarking and help to self-measure and improve'],
    characteristics: ['Collaborative', 'Peer Evaluation', 'Team Reward'],
  },
  strategist: {
    roleLabel: 'Catalyst',
    skills: ['Strategic Planner', 'Catalyze team outcome'],
    characteristics: ['Empowered', 'Peer Evaluation', 'Team Reward', 'Team Recruitment'],
  },
}

const ARCHETYPE_COLORS: Record<string, string> = {
  expert:      'bg-red-50 border-red-200 text-red-800',
  coordinator: 'bg-orange-50 border-orange-200 text-orange-800',
  peer:        'bg-blue-50 border-blue-200 text-blue-800',
  coach:       'bg-green-50 border-green-200 text-green-800',
  strategist:  'bg-purple-50 border-purple-200 text-purple-800',
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
        <ul className="space-y-1">
          {profile.skills.map(skill => (
            <li key={skill} className="flex items-start gap-2 text-sm">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {skill}
            </li>
          ))}
        </ul>
      </div>

      {/* Characteristics */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Characteristics</p>
        <ul className="space-y-1">
          {profile.characteristics.map(c => (
            <li key={c} className="flex items-start gap-2 text-sm">
              <span className="mt-1 w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              {c}
            </li>
          ))}
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

      {/* Goleman Styles */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-2">Goleman Styles</p>
        <div className="flex flex-wrap gap-2">
          {golemansStyles.map(style => (
            <span key={style} className="px-3 py-1 bg-white/60 rounded-full text-xs font-medium capitalize">
              {style}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
