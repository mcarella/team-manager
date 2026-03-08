import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { CVFAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import CVFResultCard from '../components/CVFResultCard.js'
import CVFRadarChart from '../components/CVFRadarChart.js'

type MainTab = 'mine' | 'org'

export default function CVFAssessmentPage() {
  const { currentUserId, saveCVFAssessment, members, companyProfile } = useStore()
  const navigate = useNavigate()
  const [mainTab, setMainTab] = useState<MainTab>('mine')
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

  const TABS: { key: MainTab; label: string }[] = [
    { key: 'mine', label: 'My CVF' },
    { key: 'org',  label: 'My Org' },
  ]

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Culture (CVF)</h1>
        <p className="text-gray-500 mt-2">
          Distribute 100 points across 4 culture quadrants for each of 6 categories.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="w-full max-w-lg flex gap-1 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setMainTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mainTab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── My CVF ────────────────────────────────────────────────────────────── */}
      {mainTab === 'mine' && (
        <>
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
                  Back to profile
                </Link>
              </div>
            </div>
          ) : (
            <CVFForm userId={userId} onComplete={handleComplete} />
          )}
        </>
      )}

      {/* ── My Org ────────────────────────────────────────────────────────────── */}
      {mainTab === 'org' && (
        <div className="w-full max-w-lg">
          {companyProfile ? (
            <div className="flex flex-col items-center gap-6">
              <CVFRadarChart scores={companyProfile} label="Organisation" />
              <CVFResultCard results={companyProfile} />
              <p className="text-xs text-gray-400 text-center">
                This is your organisation's culture profile, defined by the company admin.
              </p>
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400 space-y-2">
              <p className="text-lg">No organisation profile yet.</p>
              <p className="text-sm">Ask your company admin to define the culture profile.</p>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
