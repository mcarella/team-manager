import { Router, type Router as ExpressRouter } from 'express'
import { z } from 'zod'
import {
  computeBehavioralCoreFactors,
  synthesizeFactors,
  computeGolemanRadar,
  matchSubProfile,
} from '@team-manager/core'

export const behavioralCoreRouter: ExpressRouter = Router()

const BehavioralCoreSchema = z.object({
  userId: z.string().min(1),
  answers: z.object({
    selfConcept: z.array(z.string()),
    self:        z.array(z.string()),
  }),
})

// In-memory store — will be replaced by DB (Phase 6, T21).
const store: Array<{ userId: string; payload: unknown }> = []

behavioralCoreRouter.post('/', (req, res) => {
  const parsed = BehavioralCoreSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { userId, answers } = parsed.data
  try {
    const selfConceptFactors = computeBehavioralCoreFactors(answers.selfConcept)
    const selfFactors        = computeBehavioralCoreFactors(answers.self)
    const factors            = synthesizeFactors(selfConceptFactors, selfFactors)
    const golemanRadar       = computeGolemanRadar(factors)
    const subProfile         = matchSubProfile(factors)

    const assessment = {
      userId,
      answers,
      selfConceptFactors,
      selfFactors,
      factors,
      golemanRadar,
      subProfile,
      completedAt: new Date(),
    }

    store.push({ userId, payload: assessment })
    res.json(assessment)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Invalid input' })
  }
})
