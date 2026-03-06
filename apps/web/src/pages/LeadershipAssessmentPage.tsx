import { Link } from 'react-router-dom'

export default function LeadershipAssessmentPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Leadership Assessment</h1>
      <p className="text-gray-500">Answer 12 questions to discover your leadership archetype.</p>
      <div className="w-full max-w-lg p-8 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400">
        Assessment form — coming soon
      </div>
      <Link to="/" className="text-blue-600 hover:underline">← Back</Link>
    </main>
  )
}
