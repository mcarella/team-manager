import { Router, type Router as ExpressRouter } from 'express'
import { z } from 'zod'
import { aggregatePeerSkillAssessments, aggregatePeerLeadershipAssessments, aggregatePeerCVFAssessments, computeLeadershipScores, computeArchetype } from '@team-manager/core'
import type { PeerSkillAssessment, PeerLeadershipAssessment, PeerCVFAssessment } from '@team-manager/shared'

export const peerAssessmentsRouter: ExpressRouter = Router()

// In-memory stores (will be replaced by DB)
const peerSkillStore: PeerSkillAssessment[] = []
const peerLeadershipStore: PeerLeadershipAssessment[] = []
const peerCVFStore: PeerCVFAssessment[] = []

export function _resetStore(): void {
  peerSkillStore.length = 0
  peerLeadershipStore.length = 0
  peerCVFStore.length = 0
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

// ─── Peer Leadership ────────────────────────────────────────────────────────

const PeerLeadershipSchema = z.object({
  assessorId: z.string().min(1),
  subjectId:  z.string().min(1),
  answers:    z.array(z.number().int().min(1).max(10)).length(12),
})

peerAssessmentsRouter.post('/leadership', (req, res) => {
  const parsed = PeerLeadershipSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { assessorId, subjectId, answers } = parsed.data

  if (assessorId === subjectId) {
    res.status(400).json({ error: 'Cannot evaluate yourself' })
    return
  }

  const scores = computeLeadershipScores(answers)
  const archetype = computeArchetype(scores)
  const assessment: PeerLeadershipAssessment = {
    assessorId, subjectId, answers, scores, archetype, createdAt: new Date(),
  }

  const existingIdx = peerLeadershipStore.findIndex(
    (a) => a.assessorId === assessorId && a.subjectId === subjectId,
  )
  if (existingIdx >= 0) {
    peerLeadershipStore[existingIdx] = assessment
  } else {
    peerLeadershipStore.push(assessment)
  }

  res.status(201).json(assessment)
})

peerAssessmentsRouter.get('/leadership/:subjectId/summary', (req, res) => {
  const { subjectId } = req.params
  if (!subjectId) {
    res.status(400).json({ error: 'subjectId is required' })
    return
  }
  const summary = aggregatePeerLeadershipAssessments(subjectId, peerLeadershipStore)
  res.json(summary)
})

peerAssessmentsRouter.get('/leadership/:subjectId/my-assessment/:assessorId', (req, res) => {
  const { subjectId, assessorId } = req.params
  const found = peerLeadershipStore.find(
    (a) => a.subjectId === subjectId && a.assessorId === assessorId,
  )
  res.json(found ?? null)
})

// ─── Peer CVF (manager rating only) ─────────────────────────────────────────

const CVFCategorySchema = z.object({
  clan: z.number().min(0).max(100),
  adhocracy: z.number().min(0).max(100),
  market: z.number().min(0).max(100),
  hierarchy: z.number().min(0).max(100),
})

const PeerCVFSchema = z.object({
  assessorId: z.string().min(1),
  subjectId:  z.string().min(1),
  categories: z.array(CVFCategorySchema).length(6),
  results:    CVFCategorySchema,
})

peerAssessmentsRouter.post('/cvf', (req, res) => {
  const parsed = PeerCVFSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() })
    return
  }

  const { assessorId, subjectId, categories, results } = parsed.data

  if (assessorId === subjectId) {
    res.status(400).json({ error: 'Cannot evaluate yourself' })
    return
  }

  const assessment: PeerCVFAssessment = {
    assessorId, subjectId, categories, results, createdAt: new Date(),
  }

  const existingIdx = peerCVFStore.findIndex(
    (a) => a.assessorId === assessorId && a.subjectId === subjectId,
  )
  if (existingIdx >= 0) {
    peerCVFStore[existingIdx] = assessment
  } else {
    peerCVFStore.push(assessment)
  }

  res.status(201).json(assessment)
})

peerAssessmentsRouter.get('/cvf/:subjectId/summary', (req, res) => {
  const { subjectId } = req.params
  if (!subjectId) {
    res.status(400).json({ error: 'subjectId is required' })
    return
  }
  const summary = aggregatePeerCVFAssessments(subjectId, peerCVFStore)
  res.json(summary)
})

peerAssessmentsRouter.get('/cvf/:subjectId/my-assessment/:assessorId', (req, res) => {
  const { subjectId, assessorId } = req.params
  const found = peerCVFStore.find(
    (a) => a.subjectId === subjectId && a.assessorId === assessorId,
  )
  res.json(found ?? null)
})
