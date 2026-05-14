import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import type { SaboteurAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import { API_BASE } from '../lib/api.js'

/**
 * Attitude hub — Layer 3 entry point.
 *
 * If the user already took the saboteur assessment, redirect straight to
 * `/attitude/result`. The hub only renders the "Start" landing card for
 * first-time users.
 */
export default function GrowthHubPage() {
  const { t } = useTranslation(['layer3'])
  const navigate = useNavigate()
  const { currentUserId } = useStore()
  const [loaded, setLoaded] = useState(false)

  if (!currentUserId) {
    navigate('/', { replace: true })
    return null
  }

  useEffect(() => {
    fetch(`${API_BASE}/assessments/saboteur/${currentUserId}`)
      .then(r => r.json())
      .then((data: SaboteurAssessment | null) => {
        if (data) {
          navigate('/attitude/result', { replace: true })
          return
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [currentUserId, navigate])

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-4">
        {/* Page header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900">{t('layer3:hub.title')}</h1>
          <p className="text-sm text-gray-500">{t('layer3:hub.subtitle')}</p>
        </div>

        {/* First-time CTA card */}
        <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
            {t('layer3:hub.saboteurCard.eyebrow')}
          </p>
          <h2 className="text-xl font-bold text-gray-900">
            {t('layer3:hub.saboteurCard.heading')}
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            {t('layer3:hub.saboteurCard.body')}
          </p>
          <div className="pt-2">
            <Link
              to="/assessment/layer-3"
              className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('layer3:hub.saboteurCard.ctaStart')}
            </Link>
          </div>
        </article>
      </div>
    </main>
  )
}
