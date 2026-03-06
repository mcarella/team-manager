import { Router, type Router as ExpressRouter } from 'express'
import { z } from 'zod'
import {
  computeLeadershipScores,
  computeArchetype,
  computeGolemansStyles,
  computeCVFScores,
  validateCVFCategory,
} from '@team-manager/core'

export const assessmentsRouter: ExpressRouter = Router()

const LeadershipSchema = z.object({
  userId: z.string().min(1),
  answers: z.array(z.number().int().min(1).max(10)).length(12),
})

const CVFCategorySchema = z.object({
  clan:      z.number().min(0),
  adhocracy: z.number().min(0),
  market:    z.number().min(0),
  hierarchy: z.number().min(0),
})

const CVFSchema = z.object({
  userId:     z.string().min(1),
  categories: z.array(CVFCategorySchema).length(6),
})

assessmentsRouter.post('/leadership', (req, res) => {
  const parsed = LeadershipSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { userId, answers } = parsed.data
  try {
    const scores = computeLeadershipScores(answers)
    const archetype = computeArchetype(scores)
    const golemansStyles = computeGolemansStyles(archetype)
    res.json({ userId, scores, archetype, golemansStyles, completedAt: new Date() })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' })
  }
})

assessmentsRouter.post('/cvf', (req, res) => {
  const parsed = CVFSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { userId, categories } = parsed.data
  try {
    for (const cat of categories) {
      validateCVFCategory(cat)
    }
    const results = computeCVFScores(categories)
    res.json({ userId, categories, results, completedAt: new Date() })
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' })
  }
})
