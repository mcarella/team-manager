import { useState } from 'react'
import { seed } from '../seed.js'

export default function SeedPage() {
  const [result, setResult] = useState<ReturnType<typeof seed> | null>(null)

  const handleSeed = () => {
    const res = seed()
    setResult(res)
  }

  const handleSeedAndReload = () => {
    seed()
    window.location.href = '/'
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Seed Test Data</h1>
        <p className="text-gray-500 mt-2 max-w-md">
          Wipes localStorage and generates randomized synthetic data:
          20 members, 4 teams, 2 managers, company profile, and all assessments.
        </p>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSeed}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
        >
          Seed data
        </button>
        <button
          onClick={handleSeedAndReload}
          className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
        >
          Seed &amp; go to login
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 w-full max-w-md space-y-3">
          <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Generated</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-blue-50 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{result.members}</p>
              <p className="text-xs text-blue-500">Members</p>
            </div>
            <div className="bg-orange-50 rounded-xl px-4 py-3 text-center">
              <p className="text-2xl font-bold text-orange-600">{result.teams}</p>
              <p className="text-xs text-orange-500">Teams</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Managers (login as manager):</p>
            {result.managers.map(m => (
              <p key={m} className="text-sm font-mono bg-gray-50 rounded px-3 py-1.5">{m}</p>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Company (login as company):</p>
            <p className="text-sm font-mono bg-gray-50 rounded px-3 py-1.5">{result.companyName}</p>
            <div className="flex gap-2 text-xs mt-1">
              {Object.entries(result.companyProfile).map(([k, v]) => (
                <span key={k} className="px-2 py-1 bg-purple-50 text-purple-700 rounded capitalize">
                  {k}: {v}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500">Sample members (login as member):</p>
            {result.sampleMembers.map(m => (
              <p key={m} className="text-sm font-mono bg-gray-50 rounded px-3 py-1.5">{m}</p>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
