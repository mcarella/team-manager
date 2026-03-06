import { useState } from 'react'
import type { LeadershipAssessment } from '@team-manager/shared'
import { computeLeadershipScores, computeArchetype, computeGolemansStyles } from '@team-manager/core'

const QUESTIONS = [
  'I set clear, non-negotiable standards and enforce them consistently.',        // q1  → catalyzing (1+11)
  'I articulate a compelling long-term vision that others rally around.',        // q2  → envisioning (2+9)
  'I challenge people to exceed their current performance levels.',              // q3  → demanding (3+12)
  'I invest time in understanding each person\'s strengths and development.',    // q4  → coaching (4+10)
  'I involve the team in decisions and build consensus before acting.',          // q5  → conducting (5+7)
  'I give precise instructions and expect them to be followed.',                 // q6  → directing (6+8)
  'I facilitate discussions to surface the best ideas from the group.',          // q7  → conducting
  'I monitor execution closely and correct deviations immediately.',             // q8  → directing
  'I help people connect their work to a bigger organisational purpose.',        // q9  → envisioning
  'I create personalised growth plans and follow up on them regularly.',         // q10 → coaching
  'I inspire people to see patterns and possibilities beyond the obvious.',      // q11 → catalyzing
  'I push myself and others to deliver at maximum pace without excuses.',        // q12 → demanding
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
