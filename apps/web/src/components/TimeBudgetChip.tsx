import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  budgetMinutes: number
}

export default function TimeBudgetChip({ budgetMinutes }: Props) {
  const { t } = useTranslation(['layer1'])
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const elapsedSec = Math.max(0, Math.floor((now - startedAt) / 1000))
  const minutes = Math.floor(elapsedSec / 60)
  const seconds = elapsedSec % 60
  const overBudget = elapsedSec > budgetMinutes * 60

  return (
    <div
      aria-live="polite"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
        overBudget
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-forma-border bg-forma-surface text-forma-muted'
      }`}
    >
      <span aria-hidden>⏱</span>
      <span>
        {t('layer1:timeBudget.elapsed', {
          minutes,
          seconds: seconds.toString().padStart(2, '0'),
        })}
      </span>
      <span className="opacity-60">
        / {t('layer1:timeBudget.target', { minutes: budgetMinutes })}
      </span>
      {overBudget && (
        <span className="opacity-90">· {t('layer1:timeBudget.over')}</span>
      )}
    </div>
  )
}
