import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'
import { _resetStore } from './routes/peer-assessments.js'

const app = createApp()

beforeEach(() => {
  _resetStore()
})

describe('POST /peer-assessments/skills', () => {
  it('returns 201 with created assessment', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 3 })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      assessorId: 'peer-1',
      subjectId: 'user-1',
      skillId: 'skill-a',
      level: 3,
    })
    expect(res.body.createdAt).toBeDefined()
  })

  it('returns 400 when assessorId equals subjectId (self-evaluation)', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'user-1', subjectId: 'user-1', skillId: 'skill-a', level: 3 })

    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cannot evaluate yourself')
  })

  it('returns 400 when assessorId is missing', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ subjectId: 'user-1', skillId: 'skill-a', level: 3 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when subjectId is missing', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', skillId: 'skill-a', level: 3 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when skillId is missing', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', level: 3 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when level is out of range (0-4)', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 5 })

    expect(res.status).toBe(400)
  })

  it('returns 400 when level is negative', async () => {
    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: -1 })

    expect(res.status).toBe(400)
  })

  it('upserts when same assessor evaluates same skill for same subject', async () => {
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 2 })

    const res = await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 4 })

    expect(res.status).toBe(201)

    // Verify via summary — should have count 1, not 2
    const summary = await request(app).get('/peer-assessments/skills/user-1/summary')
    expect(summary.body.skills['skill-a']).toEqual({ average: 4, count: 1 })
    expect(summary.body.totalEvaluators).toBe(1)
  })
})

describe('GET /peer-assessments/skills/:subjectId/summary', () => {
  it('returns empty summary when no assessments exist', async () => {
    const res = await request(app).get('/peer-assessments/skills/user-1/summary')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      subjectId: 'user-1',
      skills: {},
      totalEvaluators: 0,
    })
  })

  it('returns aggregated summary with multiple evaluators', async () => {
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 2 })
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-2', subjectId: 'user-1', skillId: 'skill-a', level: 4 })
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-b', level: 3 })

    const res = await request(app).get('/peer-assessments/skills/user-1/summary')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      subjectId: 'user-1',
      skills: {
        'skill-a': { average: 3, count: 2 },
        'skill-b': { average: 3, count: 1 },
      },
      totalEvaluators: 2,
    })
  })

  it('does not leak other subjects data', async () => {
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', skillId: 'skill-a', level: 4 })
    await request(app)
      .post('/peer-assessments/skills')
      .send({ assessorId: 'peer-1', subjectId: 'user-2', skillId: 'skill-a', level: 1 })

    const res = await request(app).get('/peer-assessments/skills/user-1/summary')

    expect(res.body.skills['skill-a']).toEqual({ average: 4, count: 1 })
    expect(res.body.totalEvaluators).toBe(1)
  })
})

describe('POST /peer-assessments/behavioral-core', () => {
  it('returns 201 with the saved peer Behavioral Core assessment (factors + sub-profile computed server-side)', async () => {
    const res = await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', picks: ['a01', 'a02', 'a07'] })

    expect(res.status).toBe(201)
    expect(res.body).toMatchObject({
      assessorId: 'peer-1',
      subjectId: 'user-1',
      picks: ['a01', 'a02', 'a07'],
    })
    expect(res.body.factors).toMatchObject({
      dominance: expect.any(Number),
      extraversion: expect.any(Number),
      patience: expect.any(Number),
      formality: expect.any(Number),
    })
    expect(res.body.subProfile).toEqual(expect.any(String))
    expect(res.body.createdAt).toBeDefined()
  })

  it('returns 400 when assessor and subject are the same', async () => {
    const res = await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'user-1', subjectId: 'user-1', picks: [] })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('Cannot evaluate yourself')
  })

  it('returns 400 when picks is missing', async () => {
    const res = await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'peer-1', subjectId: 'user-1' })
    expect(res.status).toBe(400)
  })

  it('upserts when the same peer submits twice for the same subject', async () => {
    await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', picks: ['a01'] })
    await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'peer-1', subjectId: 'user-1', picks: ['a07', 'a08'] })

    const summary = await request(app).get('/peer-assessments/behavioral-core/user-1/summary')
    expect(summary.body.totalEvaluators).toBe(1)
    expect(summary.body.adjectiveFrequency).toEqual({ a07: 1, a08: 1 })
  })
})

describe('GET /peer-assessments/behavioral-core/:subjectId/summary', () => {
  it('returns an empty summary when no peers have assessed', async () => {
    const res = await request(app).get('/peer-assessments/behavioral-core/user-1/summary')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      subjectId: 'user-1',
      totalEvaluators: 0,
      adjectiveFrequency: {},
      subProfile: null,
    })
  })

  it('aggregates multiple peer assessments', async () => {
    await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'p1', subjectId: 'user-1', picks: ['a01', 'a02'] })
    await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'p2', subjectId: 'user-1', picks: ['a01', 'a07'] })

    const res = await request(app).get('/peer-assessments/behavioral-core/user-1/summary')
    expect(res.body.totalEvaluators).toBe(2)
    expect(res.body.adjectiveFrequency).toEqual({ a01: 2, a02: 1, a07: 1 })
  })
})

describe('GET /peer-assessments/behavioral-core/:subjectId/my-assessment/:assessorId', () => {
  it('returns null when the assessor has no prior assessment for the subject', async () => {
    const res = await request(app).get('/peer-assessments/behavioral-core/user-1/my-assessment/peer-x')
    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  it('returns the existing assessment so the form can be pre-populated', async () => {
    await request(app)
      .post('/peer-assessments/behavioral-core')
      .send({ assessorId: 'p1', subjectId: 'user-1', picks: ['a01', 'a02'] })

    const res = await request(app).get('/peer-assessments/behavioral-core/user-1/my-assessment/p1')
    expect(res.body.picks).toEqual(['a01', 'a02'])
  })
})
