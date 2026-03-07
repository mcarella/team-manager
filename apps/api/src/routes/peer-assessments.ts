import { Router, type Router as ExpressRouter } from 'express'
import { z } from 'zod'
import { aggregatePeerSkillAssessments } from '@team-manager/core'
import type { PeerSkillAssessment } from '@team-manager/shared'

export const peerAssessmentsRouter: ExpressRouter = Router()

// In-memory store (will be replaced by DB)
const peerSkillStore: PeerSkillAssessment[] = []

export function _resetStore(): void {
  peerSkillStore.length = 0
}

const PeerSkillSchema = z.object({
  assessorId: z.string().min(1),
  subjectId: z.string().min(1),
  skillId: z.string().min(1),
  level: z.number().int().min(0).max(4),
})

peerAssessmentsRouter.post('/skills', (req, res) => {
  const parsed = PeerSkillSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { assessorId, subjectId, skillId, level } = parsed.data

  if (assessorId === subjectId) {
    res.status(400).json({ error: 'Cannot evaluate yourself' })
    return
  }

  // Upsert: replace existing assessment for same assessor+subject+skill
  const existingIdx = peerSkillStore.findIndex(
    (a) => a.assessorId === assessorId && a.subjectId === subjectId && a.skillId === skillId,
  )

  const assessment: PeerSkillAssessment = {
    assessorId,
    subjectId,
    skillId,
    level: level as 0 | 1 | 2 | 3 | 4,
    createdAt: new Date(),
  }

  if (existingIdx >= 0) {
    peerSkillStore[existingIdx] = assessment
  } else {
    peerSkillStore.push(assessment)
  }

  res.status(201).json(assessment)
})

peerAssessmentsRouter.get('/skills/:subjectId/summary', (req, res) => {
  const { subjectId } = req.params
  if (!subjectId) {
    res.status(400).json({ error: 'subjectId is required' })
    return
  }

  const summary = aggregatePeerSkillAssessments(subjectId, peerSkillStore)
  res.json(summary)
})
