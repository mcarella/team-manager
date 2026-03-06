import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LeadershipAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import LeadershipForm from '../components/LeadershipForm.js'
import ArchetypeCard from '../components/ArchetypeCard.js'

export default function LeadershipAssessmentPage() {
  const { currentUserId, saveLeadershipAssessment, members } = useStore()
  const navigate = useNavigate()
  const [result, setResult] = useState<LeadershipAssessment | null>(null)
  const [retaking, setRetaking] = useState(false)

  const userId = currentUserId ?? ''
  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.leadership

  if (!userId) {
    navigate('/', { replace: true })
    return null
  }

  const handleComplete = (assessment: LeadershipAssessment) => {
    saveLeadershipAssessment(assessment)
    setResult(assessment)
    setRetaking(false)
  }

  const displayResult = result ?? (!retaking ? existingAssessment ?? null : null)

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Leadership Assessment</h1>
        <p className="text-gray-500 mt-2">Answer 12 questions to discover your leadership archetype.</p>
      </div>

      {displayResult ? (
        <div className="flex flex-col items-center gap-6">
          <ArchetypeCard assessment={displayResult} />
          <div className="flex gap-4">
            <button
              onClick={() => { setResult(null); setRetaking(true) }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Retake assessment
            </button>
            <Link to="/onboarding" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Continue
            </Link>
          </div>
        </div>
      ) : (
        <LeadershipForm userId={userId} onComplete={handleComplete} />
      )}
    </main>
  )
}
