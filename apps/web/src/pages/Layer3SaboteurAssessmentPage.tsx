import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { SABOTEUR_QUESTIONS, PQ_EMOTION_PAIRS } from '@team-manager/core'
import type { LikertValue } from '@team-manager/shared'
import { useStore } from '../store/index.js'
import { API_BASE } from '../lib/api.js'
import TimeBudgetChip from '../components/TimeBudgetChip.js'

type Phase = 'intro' | 'saboteur' | 'pq' | 'submitting'

const SABOTEUR_PER_PAGE = 10  // 50 / 10 = 5 pages
const PQ_PER_PAGE = 8         // 24 / 8 = 3 pages

const SABOTEUR_PAGES = Math.ceil(SABOTEUR_QUESTIONS.length / SABOTEUR_PER_PAGE)
const PQ_PAGES = Math.ceil(PQ_EMOTION_PAIRS.length / PQ_PER_PAGE)

const LIKERT_VALUES: LikertValue[] = [1, 2, 3, 4, 5]

export default function Layer3SaboteurAssessmentPage() {
  const { t } = useTranslation(['layer3'])
  const navigate = useNavigate()
  const { currentUserId } = useStore()

  if (!currentUserId) {
    navigate('/', { replace: true })
    return null
  }

  const [phase, setPhase] = useState<Phase>('intro')
  const [pageIndex, setPageIndex] = useState(0)
  const [saboteurAnswers, setSaboteurAnswers] = useState<(LikertValue | null)[]>(
    () => new Array(SABOTEUR_QUESTIONS.length).fill(null),
  )
  const [pqAnswers, setPqAnswers] = useState<Array<{ pos: LikertValue | null; neg: LikertValue | null }>>(
    () => PQ_EMOTION_PAIRS.map(() => ({ pos: null, neg: null })),
  )
  const [error, setError] = useState<string | null>(null)

  // ── Derived progress info ─────────────────────────────────────────────────
  const totalAnswered = useMemo(() => {
    const sabDone = saboteurAnswers.filter(a => a !== null).length
    const pqDone = pqAnswers.filter(p => p.pos !== null && p.neg !== null).length
    return sabDone + pqDone
  }, [saboteurAnswers, pqAnswers])
  const totalItems = SABOTEUR_QUESTIONS.length + PQ_EMOTION_PAIRS.length

  // ── Handlers ──────────────────────────────────────────────────────────────
  const setSaboteur = (index: number, value: LikertValue) => {
    setSaboteurAnswers(prev => prev.map((a, i) => (i === index ? value : a)))
  }
  const setPq = (index: number, side: 'pos' | 'neg', value: LikertValue) => {
    setPqAnswers(prev => prev.map((p, i) => (i === index ? { ...p, [side]: value } : p)))
  }

  const handleSubmit = async () => {
    setPhase('submitting')
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/assessments/saboteur`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          saboteurAnswers,
          pqAnswers,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Submission failed: ${body}`)
      }
      navigate('/attitude/result', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error')
      setPhase('pq')
      setPageIndex(PQ_PAGES - 1)
    }
  }

  // ── Page helpers ──────────────────────────────────────────────────────────
  const saboteurPageStart = pageIndex * SABOTEUR_PER_PAGE
  const saboteurPageEnd = Math.min(saboteurPageStart + SABOTEUR_PER_PAGE, SABOTEUR_QUESTIONS.length)
  const saboteurPageItems = SABOTEUR_QUESTIONS.slice(saboteurPageStart, saboteurPageEnd)

  const pqPageStart = pageIndex * PQ_PER_PAGE
  const pqPageEnd = Math.min(pqPageStart + PQ_PER_PAGE, PQ_EMOTION_PAIRS.length)
  const pqPageItems = PQ_EMOTION_PAIRS.slice(pqPageStart, pqPageEnd)

  const saboteurPageComplete = saboteurPageItems.every(
    (_, i) => saboteurAnswers[saboteurPageStart + i] !== null,
  )
  const pqPageComplete = pqPageItems.every((_, i) => {
    const a = pqAnswers[pqPageStart + i]
    return a !== undefined && a.pos !== null && a.neg !== null
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-3xl space-y-4">

        {/* Header row: title + time chip */}
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('layer3:assessment.title')}</h1>
          </div>
          {phase !== 'intro' && phase !== 'submitting' && <TimeBudgetChip budgetMinutes={10} />}
        </div>

        {/* Progress bar — visible from saboteur step onwards */}
        {(phase === 'saboteur' || phase === 'pq') && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>
                {t('layer3:assessment.navigation.progress', { current: totalAnswered, total: totalItems })}
              </span>
              <span className="font-mono">{Math.round((totalAnswered / totalItems) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all"
                style={{ width: `${(totalAnswered / totalItems) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Intro ───────────────────────────────────────────────────────── */}
        {phase === 'intro' && (
          <article className="rounded-2xl border-2 border-gray-200 bg-white p-6 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
              {t('layer3:assessment.intro.eyebrow')}
            </p>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('layer3:assessment.intro.heading')}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t('layer3:assessment.intro.body')}
            </p>
            <button
              type="button"
              onClick={() => { setPhase('saboteur'); setPageIndex(0) }}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors"
            >
              {t('layer3:assessment.intro.begin')}
            </button>
          </article>
        )}

        {/* ── Saboteur step ───────────────────────────────────────────────── */}
        {phase === 'saboteur' && (
          <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-5">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                {t('layer3:assessment.saboteurStep.title')} ·{' '}
                {t('layer3:assessment.saboteurStep.pageHeading', { current: pageIndex + 1, total: SABOTEUR_PAGES })}
              </p>
              <p className="text-sm text-gray-500">{t('layer3:assessment.saboteurStep.instructions')}</p>
            </header>

            <ol className="space-y-5">
              {saboteurPageItems.map((q, i) => {
                const idx = saboteurPageStart + i
                const current = saboteurAnswers[idx] ?? null
                return (
                  <li key={q.id} className="space-y-2">
                    <p className="text-sm text-gray-800 leading-snug">
                      <span className="text-xs font-mono text-gray-400 mr-2">Q{idx + 1}.</span>
                      {t(`layer3:questions.${q.id}`)}
                    </p>
                    <Likert5
                      value={current}
                      onChange={v => setSaboteur(idx, v)}
                    />
                  </li>
                )
              })}
            </ol>

            <NavRow
              showBack={pageIndex > 0}
              onBack={() => setPageIndex(p => p - 1)}
              nextDisabled={!saboteurPageComplete}
              nextDisabledHint={t('layer3:assessment.navigation.completeRequired')}
              onNext={() => {
                if (pageIndex + 1 < SABOTEUR_PAGES) {
                  setPageIndex(p => p + 1)
                } else {
                  setPhase('pq')
                  setPageIndex(0)
                }
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
            />
          </article>
        )}

        {/* ── PQ step ─────────────────────────────────────────────────────── */}
        {phase === 'pq' && (
          <article className="rounded-2xl border-2 border-gray-200 bg-white p-5 space-y-5">
            <header className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-indigo-700">
                {t('layer3:assessment.pqStep.title')} ·{' '}
                {t('layer3:assessment.pqStep.pageHeading', { current: pageIndex + 1, total: PQ_PAGES })}
              </p>
              <p className="text-sm text-gray-500">{t('layer3:assessment.pqStep.instructions')}</p>
            </header>

            <ol className="space-y-6">
              {pqPageItems.map((p, i) => {
                const idx = pqPageStart + i
                const current = pqAnswers[idx]!
                const posLabel = t(`layer3:pqPairs.${p.id}.positive`)
                const negLabel = t(`layer3:pqPairs.${p.id}.negative`)
                return (
                  <li key={p.id} className="space-y-3 border-t border-gray-100 pt-4 first:border-t-0 first:pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-emerald-700">{posLabel}</span>
                        <span className="text-xs text-gray-400">{t('layer3:assessment.pqStep.positiveLabel')}</span>
                      </div>
                      <Likert5 value={current.pos} onChange={v => setPq(idx, 'pos', v)} accent="emerald" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-rose-700">{negLabel}</span>
                        <span className="text-xs text-gray-400">{t('layer3:assessment.pqStep.negativeLabel')}</span>
                      </div>
                      <Likert5 value={current.neg} onChange={v => setPq(idx, 'neg', v)} accent="rose" />
                    </div>
                  </li>
                )
              })}
            </ol>

            <NavRow
              showBack
              onBack={() => {
                if (pageIndex === 0) {
                  setPhase('saboteur')
                  setPageIndex(SABOTEUR_PAGES - 1)
                } else {
                  setPageIndex(p => p - 1)
                }
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              nextDisabled={!pqPageComplete}
              nextDisabledHint={t('layer3:assessment.navigation.completeRequired')}
              isFinalSubmit={pageIndex + 1 === PQ_PAGES}
              onNext={() => {
                if (pageIndex + 1 < PQ_PAGES) {
                  setPageIndex(p => p + 1)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                } else {
                  void handleSubmit()
                }
              }}
            />

            {error && (
              <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
            )}
          </article>
        )}

        {/* ── Submitting ──────────────────────────────────────────────────── */}
        {phase === 'submitting' && (
          <article className="rounded-2xl border-2 border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
            {t('layer3:assessment.navigation.submitting')}
          </article>
        )}
      </div>
    </main>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function Likert5({
  value,
  onChange,
  accent = 'indigo',
}: {
  value: LikertValue | null
  onChange: (v: LikertValue) => void
  accent?: 'indigo' | 'emerald' | 'rose'
}) {
  const { t } = useTranslation(['layer3'])
  const accentClasses: Record<typeof accent, { selected: string; ring: string }> = {
    indigo:  { selected: 'bg-indigo-600 text-white border-indigo-600',   ring: 'ring-indigo-200' },
    emerald: { selected: 'bg-emerald-600 text-white border-emerald-600', ring: 'ring-emerald-200' },
    rose:    { selected: 'bg-rose-600 text-white border-rose-600',       ring: 'ring-rose-200' },
  }
  const cls = accentClasses[accent]
  return (
    <div className="space-y-1.5">
      <div className="flex items-stretch gap-1.5">
        {LIKERT_VALUES.map(v => {
          const selected = value === v
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              aria-pressed={selected}
              className={`flex-1 min-h-10 rounded-lg border text-sm font-semibold transition-all ${
                selected
                  ? `${cls.selected} ring-2 ${cls.ring}`
                  : 'bg-white border-gray-200 text-gray-700 hover:border-gray-400'
              }`}
            >
              {v}
            </button>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 px-0.5">
        <span>{t('layer3:assessment.scale.endLow')}</span>
        <span>{t('layer3:assessment.scale.endHigh')}</span>
      </div>
    </div>
  )
}

function NavRow({
  showBack,
  onBack,
  onNext,
  nextDisabled,
  nextDisabledHint,
  isFinalSubmit = false,
}: {
  showBack: boolean
  onBack: () => void
  onNext: () => void
  nextDisabled: boolean
  nextDisabledHint: string
  isFinalSubmit?: boolean
}) {
  const { t } = useTranslation(['layer3'])
  return (
    <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-3">
      <button
        type="button"
        onClick={onBack}
        disabled={!showBack}
        className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {t('layer3:assessment.navigation.back')}
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={nextDisabled}
        title={nextDisabled ? nextDisabledHint : undefined}
        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          nextDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-indigo-600 text-white hover:bg-indigo-700'
        }`}
      >
        {isFinalSubmit ? t('layer3:assessment.navigation.submit') : t('layer3:assessment.navigation.next')}
      </button>
    </div>
  )
}
