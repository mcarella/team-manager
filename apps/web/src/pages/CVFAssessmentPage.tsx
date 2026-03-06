import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CVFAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import CVFResultCard from '../components/CVFResultCard.js'
import CVFRadarChart from '../components/CVFRadarChart.js'

export default function CVFAssessmentPage() {
  const { currentUserId, saveCVFAssessment, members } = useStore()
  const navigate = useNavigate()
  const [result, setResult] = useState<CVFAssessment | null>(null)
  const [retaking, setRetaking] = useState(false)

  const userId = currentUserId ?? ''
  const member = members.find(m => m.user.id === userId)
  const existingAssessment = member?.cvf

  if (!userId) {
    navigate('/', { replace: true })
    return null
  }

  const handleComplete = (assessment: CVFAssessment) => {
    saveCVFAssessment(assessment)
    setResult(assessment)
    setRetaking(false)
  }

  const displayResult = result ?? (!retaking ? existingAssessment ?? null : null)

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">CVF Assessment</h1>
        <p className="text-gray-500 mt-2">
          Distribute 100 points across 4 culture quadrants for each of 6 categories.
        </p>
      </div>

      {displayResult ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          <CVFRadarChart scores={displayResult.results} label="You" />
          <CVFResultCard results={displayResult.results} />
          <div className="flex gap-4">
            <button
              onClick={() => { setResult(null); setRetaking(true) }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Retake assessment
            </button>
            <Link to="/onboarding" className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
              Continue
            </Link>
          </div>
        </div>
      ) : (
        <CVFForm userId={userId} onComplete={handleComplete} />
      )}
    </main>
  )
}
