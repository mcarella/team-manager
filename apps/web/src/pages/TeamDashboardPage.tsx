import { useParams, Link } from 'react-router-dom'

export default function TeamDashboardPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold">Team Dashboard</h1>
      <p className="text-gray-500">Team: <span className="font-mono">{id}</span></p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400">
          Archetype Distribution
        </div>
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400">
          CVF Radar Chart
        </div>
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 text-center text-gray-400">
          Skills Kiviat
        </div>
      </div>
      <Link to="/" className="text-blue-600 hover:underline">← Back</Link>
    </main>
  )
}
