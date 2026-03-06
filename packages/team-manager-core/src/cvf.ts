import type { CVFCategory, CVFScores } from '@team-manager/shared'

const QUADRANTS: (keyof CVFCategory)[] = ['clan', 'adhocracy', 'market', 'hierarchy']

export function validateCVFCategory(category: CVFCategory): void {
  for (const q of QUADRANTS) {
    if (category[q] < 0) {
      throw new Error(`CVF value cannot be negative: ${q} = ${category[q]}`)
    }
  }
  const total = QUADRANTS.reduce((sum, q) => sum + category[q], 0)
  if (total !== 100) {
    throw new Error(`CVF category must sum to 100, got ${total}`)
  }
}

export function computeCVFScores(categories: CVFCategory[]): CVFScores {
  if (categories.length !== 6) {
    throw new Error(`Expected 6 CVF categories, got ${categories.length}`)
  }
  for (const category of categories) {
    validateCVFCategory(category)
  }
  return {
    clan:      categories.reduce((sum, c) => sum + c.clan, 0),
    adhocracy: categories.reduce((sum, c) => sum + c.adhocracy, 0),
    market:    categories.reduce((sum, c) => sum + c.market, 0),
    hierarchy: categories.reduce((sum, c) => sum + c.hierarchy, 0),
  }
}
