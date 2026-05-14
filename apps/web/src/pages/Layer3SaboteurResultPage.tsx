import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ALL_SABOTEUR_IDS } from '@team-manager/core'
import type { SaboteurAssessment } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import { API_BASE } from '../lib/api.js'
import KiviatChart from '../components/KiviatChart.js'
import SaboteurCard from '../components/SaboteurCard.js'
import SagePowerCard from '../components/SagePowerCard.js'
import PQGauge from '../components/PQGauge.js'

const SABOTEUR_LABELS: Record<string, string> = {
  judge: 'Judge',
  stickler: 'Stickler',
  pleaser: 'Pleaser',
  hyperAchiever: 'Hyper-Achiever',
  victim: 'Victim',
  hyperRational: 'Hyper-Rational',
  hyperVigilant: 'Hyper-Vigilant',
  restless: 'Restless',
  controller: 'Controller',
  avoider: 'Avoider',
}

export default function Layer3SaboteurResultPage() {
  const { t } = useTranslation(['layer3'])
  const navigate = useNavigate()
  const { currentUserId } = useStore()
  const [assessment, setAssessment] = useState<SaboteurAssessment | null>(null)
  const [loaded, setLoaded] = useState(false)

  if (!currentUserId) {
    navigate('/', { replace: true })
    return null
  }

  useEffect(() => {
    fetch(`${API_BASE}/assessments/saboteur/${currentUserId}`)
      .then(r => r.json())
      .then((data: SaboteurAssessment | null) => {
        setAssessment(data)
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [currentUserId])

  if (!loaded) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex items-center justify-center">
        <p className="text-sm text-gray-400">Loading…</p>
      </main>
    )
  }

  if (!assessment) {
    return (
      <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center">
        <div className="w-full max-w-3xl space-y-4">
          <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center space-y-3">
            <p className="text-sm text-gray-500">No saboteur assessment yet.</p>
            <Link
              to="/assessment/layer-3"
              className="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700"
            >
              {t('layer3:hub.saboteurCard.ctaStart')}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const radarAxes = ALL_SABOTEUR_IDS.map(id => ({
    label: SABOTEUR_LABELS[id] ?? id,
    value: assessment.saboteurScores[id],
  }))

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-4">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <Link to="/attitude" className="text-xs text-gray-500 hover:text-gray-800">
              {t('layer3:result.backToGrowth')}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">{t('layer3:result.title')}</h1>
          </div>
          <Link
            to="/assessment/layer-3"
            className="text-xs text-gray-500 hover:text-gray-800"
          >
            {t('layer3:result.retake')}
          </Link>
        </div>

        {/* PQ gauge card */}
        <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-3 flex flex-col items-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700 self-start">
            {t('layer3:result.pqHeading')}
          </p>
          <PQGauge score={assessment.pqScore} interpretation={assessment.pqInterpretation} />
          <p className="text-[11px] text-gray-400 max-w-md text-center leading-relaxed pt-2">
            {t('layer3:result.pqHint')}
          </p>
        </article>

        {/* Radar card */}
        <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
            {t('layer3:result.radarHeading')}
          </p>
          <div className="flex justify-center">
            <KiviatChart
              axes={radarAxes}
              fullMark={10}
              color="#4f46e5"
              seriesName="You"
              outerRadius={130}
            />
          </div>
          <p className="text-[11px] text-gray-400 text-center">{t('layer3:result.radarHint')}</p>
        </article>

        {/* Top 3 saboteur cards */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-1">
            {t('layer3:result.topThreeHeading')}
          </p>
          {assessment.topSaboteurs.map((id, i) => (
            <SaboteurCard
              key={id}
              saboteurId={id}
              score={assessment.saboteurScores[id]}
              size="rich"
              isCurrent={i === 0}
            />
          ))}
        </section>

        {/* Sage Powers */}
        <section className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 px-1">
            {t('layer3:result.sagePowersHeading')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {assessment.recommendedSagePowers.map(id => (
              <SagePowerCard key={id} sagePowerId={id} />
            ))}
          </div>
        </section>

        {/* Explore the other saboteurs — click to expand */}
        <section className="space-y-3">
          <div className="px-1 space-y-0.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
              {t('layer3:result.exploreOthersHeading')}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t('layer3:result.exploreOthersHint')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ALL_SABOTEUR_IDS
              .filter(id => !assessment.topSaboteurs.includes(id))
              .map(id => (
                <SaboteurCard
                  key={id}
                  saboteurId={id}
                  score={assessment.saboteurScores[id]}
                  size="compact"
                  expandable
                />
              ))}
          </div>
        </section>
      </div>
    </main>
  )
}
