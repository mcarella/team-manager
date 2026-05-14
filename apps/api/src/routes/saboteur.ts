import { Router, type Router as ExpressRouter } from 'express'
import { z } from 'zod'
import {
  computeSaboteurScores,
  computePQScore,
  interpretPQ,
  rankSaboteurs,
  recommendSagePowers,
} from '@team-manager/core'
import type { SaboteurAssessment, LikertValue } from '@team-manager/shared'

export const saboteurRouter: ExpressRouter = Router()

const Likert = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])

const SaboteurSchema = z.object({
  userId: z.string().min(1),
  saboteurAnswers: z.array(Likert).length(50),
  pqAnswers: z.array(z.object({ pos: Likert, neg: Likert })).length(24),
})

// In-memory store, keyed by userId (upsert). Mirrors the pattern used by
// behavioral-core / assessments routes — will be replaced by Drizzle later.
const store = new Map<string, SaboteurAssessment>()

export function _resetSaboteurStore(): void {
  store.clear()
}

saboteurRouter.post('/', (req, res) => {
  const parsed = SaboteurSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { userId, saboteurAnswers, pqAnswers } = parsed.data
  try {
    const saboteurScores = computeSaboteurScores(saboteurAnswers as LikertValue[])
    const rankedSaboteurs = rankSaboteurs(saboteurScores)
    const topSaboteurs = rankedSaboteurs.slice(0, 3)
    const pqScore = computePQScore(pqAnswers as Array<{ pos: LikertValue; neg: LikertValue }>)
    const pqInterpretation = interpretPQ(pqScore)
    const recommendedSagePowers = recommendSagePowers(topSaboteurs)

    const assessment: SaboteurAssessment = {
      userId,
      saboteurAnswers: saboteurAnswers as LikertValue[],
      pqAnswers: pqAnswers as Array<{ pos: LikertValue; neg: LikertValue }>,
      saboteurScores,
      rankedSaboteurs,
      topSaboteurs,
      pqScore,
      pqInterpretation,
      recommendedSagePowers,
      completedAt: new Date(),
    }

    store.set(userId, assessment)
    res.status(201).json(assessment)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' })
  }
})

saboteurRouter.get('/:userId', (req, res) => {
  const { userId } = req.params
  if (!userId) {
    res.status(400).json({ error: 'userId is required' })
    return
  }
  res.json(store.get(userId) ?? null)
})
