import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'
import { _resetSaboteurStore } from './routes/saboteur.js'

const app = createApp()

const validAnswers = new Array(50).fill(3)
const validPQ = new Array(24).fill({ pos: 3, neg: 3 })

beforeEach(() => {
  _resetSaboteurStore()
})

describe('POST /assessments/saboteur', () => {
  it('returns 201 with full assessment payload on valid input', async () => {
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: validAnswers, pqAnswers: validPQ })

    expect(res.status).toBe(201)
    expect(res.body.userId).toBe('user-1')
    expect(res.body.saboteurScores).toBeDefined()
    expect(res.body.rankedSaboteurs).toHaveLength(10)
    expect(res.body.topSaboteurs).toHaveLength(3)
    expect(res.body.pqScore).toBe(50) // all-midpoint pairs → exactly 50
    expect(res.body.pqInterpretation).toBeDefined()
    expect(res.body.recommendedSagePowers.length).toBeLessThanOrEqual(3)
    expect(res.body.completedAt).toBeDefined()
  })

  it('returns 400 when saboteurAnswers length is wrong', async () => {
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: [1, 2, 3], pqAnswers: validPQ })
    expect(res.status).toBe(400)
  })

  it('returns 400 when pqAnswers length is wrong', async () => {
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: validAnswers, pqAnswers: [{ pos: 3, neg: 3 }] })
    expect(res.status).toBe(400)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ saboteurAnswers: validAnswers, pqAnswers: validPQ })
    expect(res.status).toBe(400)
  })

  it('returns 400 when a Likert answer is out of 1-5 range', async () => {
    const badAnswers = [...validAnswers]
    badAnswers[0] = 6
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: badAnswers, pqAnswers: validPQ })
    expect(res.status).toBe(400)
  })

  it('upserts on second submission for the same user', async () => {
    await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: validAnswers, pqAnswers: validPQ })

    const allHigh = new Array(50).fill(5)
    const res = await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-1', saboteurAnswers: allHigh, pqAnswers: validPQ })

    expect(res.status).toBe(201)
    // The all-5s second submission should max every saboteur score.
    expect(res.body.saboteurScores.judge).toBe(10)

    const get = await request(app).get('/assessments/saboteur/user-1')
    expect(get.body.saboteurScores.judge).toBe(10)
  })
})

describe('GET /assessments/saboteur/:userId', () => {
  it('returns null when no assessment exists', async () => {
    const res = await request(app).get('/assessments/saboteur/no-such-user')
    expect(res.status).toBe(200)
    expect(res.body).toBeNull()
  })

  it('returns the stored assessment after POST', async () => {
    await request(app)
      .post('/assessments/saboteur')
      .send({ userId: 'user-2', saboteurAnswers: validAnswers, pqAnswers: validPQ })

    const res = await request(app).get('/assessments/saboteur/user-2')
    expect(res.status).toBe(200)
    expect(res.body.userId).toBe('user-2')
    expect(res.body.topSaboteurs).toHaveLength(3)
  })
})
