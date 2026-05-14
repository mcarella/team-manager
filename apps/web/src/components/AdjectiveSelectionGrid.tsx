import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { ADJECTIVES } from '@team-manager/core'

interface Props {
  selected: Set<string>
  onToggle: (id: string) => void
  /** Hex accent color for selected pills. Defaults to Forma accent (orange). */
  accent?: string
  disabled?: boolean
}

/**
 * Pure 86-adjective selection grid. Shuffles once on mount (stable across
 * renders). Parent owns the selection set + handles min-pick gating, CTAs,
 * and submission. Used by both the self-flow (two passes) and the peer-flow
 * (single pass evaluating a teammate).
 */
export default function AdjectiveSelectionGrid({
  selected,
  onToggle,
  accent,
  disabled = false,
}: Props) {
  const { t } = useTranslation(['layer2'])
  const adjectives = useMemo(() => shuffleOnce(ADJECTIVES), [])

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
      {adjectives.map(adj => {
        const isSelected = selected.has(adj.id)
        const baseClass = 'px-3 py-2 rounded-lg text-sm font-medium border transition-colors text-left disabled:opacity-50'
        return (
          <button
            key={adj.id}
            type="button"
            onClick={() => onToggle(adj.id)}
            aria-pressed={isSelected}
            disabled={disabled}
            className={`${baseClass} ${
              isSelected
                ? accent
                  ? 'text-white'
                  : 'bg-forma-accent text-white border-forma-accent'
                : 'bg-forma-surface text-forma-text border-forma-border hover:border-forma-border-hover'
            }`}
            style={
              isSelected && accent
                ? { backgroundColor: accent, borderColor: accent }
                : undefined
            }
          >
            {t(`layer2:adjectives.${adj.id}`)}
          </button>
        )
      })}
    </div>
  )
}

function shuffleOnce<T>(arr: readonly T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}
