import { useState } from 'react'
import type { CVFAssessment, CVFCategory } from '@team-manager/shared'
import { computeCVFScores } from '@team-manager/core'
import CVFCategoryRow from './CVFCategoryRow.js'

const EMPTY_CATEGORY: CVFCategory = { clan: 25, adhocracy: 25, market: 25, hierarchy: 25 }

interface Props {
  userId: string
  onComplete: (assessment: CVFAssessment) => void
}

export default function CVFForm({ userId, onComplete }: Props) {
  const [categories, setCategories] = useState<CVFCategory[]>(
    Array(6).fill(null).map(() => ({ ...EMPTY_CATEGORY }))
  )

  const categoryTotals = categories.map(c => c.clan + c.adhocracy + c.market + c.hierarchy)
  const allValid = categoryTotals.every(t => t === 100)
  const invalidCount = categoryTotals.filter(t => t !== 100).length

  const handleChange = (index: number, value: CVFCategory) => {
    setCategories(prev => prev.map((c, i) => (i === index ? value : c)))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!allValid) return
    const results = computeCVFScores(categories)
    onComplete({
      userId,
      categories,
      results,
      completedAt: new Date(),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-8">
      <div className="flex gap-3 text-xs">
        {[
          { color: 'bg-green-500',  label: 'Clan — People' },
          { color: 'bg-yellow-500', label: 'Adhocracy — Innovation' },
          { color: 'bg-red-500',    label: 'Market — Results' },
          { color: 'bg-blue-500',   label: 'Hierarchy — Stability' },
        ].map(({ color, label }) => (
          <span key={label} className="flex items-center gap-1.5 text-gray-600">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            {label}
          </span>
        ))}
      </div>

      <p className="text-sm text-gray-500">
        For each category, distribute <strong>exactly 100 points</strong> across the four quadrants.
      </p>

      <div className="space-y-6">
        {categories.map((cat, i) => (
          <CVFCategoryRow
            key={i}
            index={i}
            value={cat}
            onChange={val => handleChange(i, val)}
          />
        ))}
      </div>

      {!allValid && invalidCount > 0 && (
        <p className="text-sm text-red-600 text-center">
          {invalidCount} {invalidCount === 1 ? 'category does' : 'categories do'} not sum to 100.
        </p>
      )}

      <button
        type="submit"
        disabled={!allValid}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Compute CVF Profile
      </button>
    </form>
  )
}
