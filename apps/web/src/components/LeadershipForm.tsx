import { useState } from 'react'
import type { LeadershipAssessment } from '@team-manager/shared'
import { computeLeadershipScores, computeArchetype, computeGolemansStyles } from '@team-manager/core'

const QUESTIONS = [
  'I am good at encouraging teams to challenge their assumptions and break through to new levels of performance',  // q1  → catalyzing (1+11)
  'I am good at getting people on board, motivating them towards compelling strategic goals',                      // q2  → envisioning (2+9)
  'I believe in modeling desired behaviors and expecting others to follow my lead',                                // q3  → demanding (3+12)
  'I believe that my solution is never going to be as effective as a solution my people come up with by themselves', // q4 → coaching (4+10)
  'I encourage people to work together while making sure they are meeting their targets',                          // q5  → conducting (5+7)
  'I like to ensure high quality by being very clear about what I expect of people',                              // q6  → directing (6+8)
  'I like to make sure that individuals can get access to the people and resources they need in order to do their jobs', // q7 → conducting
  'I like to make sure the right work is always allocated to the right people',                                   // q8  → directing
  'I like to share with people goals to reach for, rather than tasks to complete',                                // q9  → envisioning
  'I prioritize long-term individual and team growth over short-term results',                                     // q10 → coaching
  'I take a back seat from active team leadership and instead support my team to govern themselves',               // q11 → catalyzing
  'I will delegate tasks but reserve the right to resume control if people are not performing adequately',         // q12 → demanding
]

interface Props {
  userId: string
  onComplete: (assessment: LeadershipAssessment) => void
}

export default function LeadershipForm({ userId, onComplete }: Props) {
  const [answers, setAnswers] = useState<number[]>(Array(12).fill(5))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const scores = computeLeadershipScores(answers)
    const archetype = computeArchetype(scores)
    const golemansStyles = computeGolemansStyles(archetype)
    onComplete({
      userId,
      answers,
      scores,
      archetype,
      golemansStyles,
      completedAt: new Date(),
    })
  }

  const setAnswer = (index: number, value: number) => {
    setAnswers(prev => prev.map((a, i) => (i === index ? value : a)))
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
      {QUESTIONS.map((question, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-start justify-between gap-4">
            <label className="text-sm text-gray-700 leading-snug">
              <span className="font-semibold text-gray-400 mr-2">Q{i + 1}.</span>
              {question}
            </label>
            <span className="shrink-0 w-8 text-center font-bold text-blue-700">
              {answers[i]}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={answers[i]}
            onChange={e => setAnswer(i, Number(e.target.value))}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1 — Never</span>
            <span>10 — Always</span>
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        Compute my Archetype
      </button>
    </form>
  )
}
