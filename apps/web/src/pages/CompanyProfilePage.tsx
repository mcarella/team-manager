import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { CVFAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import CVFForm from '../components/CVFForm.js'
import CVFRadarChart from '../components/CVFRadarChart.js'

export default function CompanyProfilePage() {
  const { companyProfile, saveCompanyProfile, currentRole } = useStore()
  const backPath = currentRole === 'company' ? '/company' : currentRole === 'manager' ? '/manager' : '/'
  const [redefining, setRedefining] = useState(false)

  const handleComplete = (assessment: CVFAssessment) => {
    saveCompanyProfile(assessment.results)
    setRedefining(false)
  }

  const showForm = !companyProfile || redefining

  return (
    <main className="min-h-screen flex flex-col items-center py-12 px-6 gap-8">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Company Culture Profile</h1>
          <p className="text-gray-500 mt-1">Define your target culture baseline for team comparison.</p>
        </div>
        <Link to={backPath} className="text-blue-600 hover:underline text-sm">← Back</Link>
      </div>

      {showForm ? (
        <CVFForm userId="__company__" onComplete={handleComplete} />
      ) : (
        <div className="w-full max-w-2xl space-y-6">
          <div className="p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <CVFRadarChart scores={companyProfile} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['clan', 'adhocracy', 'market', 'hierarchy'] as const).map(q => {
              const colors = {
                clan:      'bg-green-50  border-green-200  text-green-800',
                adhocracy: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                market:    'bg-red-50    border-red-200    text-red-800',
                hierarchy: 'bg-blue-50   border-blue-200   text-blue-800',
              }
              const labels = { clan: 'Clan', adhocracy: 'Adhocracy', market: 'Market', hierarchy: 'Hierarchy' }
              return (
                <div key={q} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${colors[q]}`}>
                  <span className="text-sm font-semibold">{labels[q]}</span>
                  <span className="text-lg font-bold">{companyProfile[q]}</span>
                </div>
              )
            })}
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setRedefining(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
            >
              Redefine profile
            </button>
            <Link to={backPath} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
              Back →
            </Link>
          </div>
        </div>
      )}
    </main>
  )
}
