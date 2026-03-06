import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LeadershipAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import LeadershipForm from '../components/LeadershipForm.js'
import ArchetypeCard from '../components/ArchetypeCard.js'

export default function LeadershipAssessmentPage() {
  const { addMember, saveLeadershipAssessment, members } = useStore()
  const [userId, setUserId] = useState('')
  const [result, setResult] = useState<LeadershipAssessment | null>(null)
  const [started, setStarted] = useState(false)

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId.trim()) return
    addMember({ id: userId.trim(), email: '', name: userId.trim(), orgId: 'default', role: 'member' })
    setStarted(true)
  }

  const handleComplete = (assessment: LeadershipAssessment) => {
    saveLeadershipAssessment(assessment)
    setResult(assessment)
  }

  const existingAssessment = members.find(m => m.user.id === userId)?.leadership

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Leadership Assessment</h1>
        <p className="text-gray-500 mt-2">Answer 12 questions to discover your leadership archetype.</p>
      </div>

      {!started ? (
        <form onSubmit={handleStart} className="flex flex-col gap-3 w-full max-w-sm">
          <label className="text-sm font-medium text-gray-700">Your name or ID</label>
          <input
            type="text"
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="e.g. mario.rossi"
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {existingAssessment && (
            <p className="text-xs text-amber-600">
              You already have an assessment. Submitting again will overwrite it.
            </p>
          )}
          <button
            type="submit"
            className="py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Start
          </button>
        </form>
      ) : result ? (
        <div className="flex flex-col items-center gap-6">
          <ArchetypeCard assessment={result} />
          <div className="flex gap-4">
            <button
              onClick={() => { setResult(null); setStarted(false); setUserId('') }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              New assessment
            </button>
            <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
              Back to home
            </Link>
          </div>
        </div>
      ) : (
        <LeadershipForm userId={userId} onComplete={handleComplete} />
      )}
    </main>
  )
}
