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
