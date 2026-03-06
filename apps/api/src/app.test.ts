import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { createApp } from './app.js'

const app = createApp()

// Valid 12 answers, all in range 1-10
const validAnswers = [8, 7, 6, 9, 5, 4, 8, 7, 6, 9, 5, 4]

// Valid 6 CVF categories, each summing to 100
const validCategories = Array(6).fill({ clan: 40, adhocracy: 30, market: 20, hierarchy: 10 })

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health')
    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({ status: 'ok' })
  })
})

describe('POST /assessments/leadership', () => {
  it('returns 200 with computed scores and archetype', async () => {
    const res = await request(app)
      .post('/assessments/leadership')
      .send({ userId: 'user-1', answers: validAnswers })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      userId: 'user-1',
      scores: expect.objectContaining({
        catalyzing: expect.any(Number),
        envisioning: expect.any(Number),
        demanding: expect.any(Number),
        coaching: expect.any(Number),
        conducting: expect.any(Number),
        directing: expect.any(Number),
      }),
      archetype: expect.stringMatching(/^(expert|coordinator|peer|coach|strategist)$/),
      golemansStyles: expect.any(Array),
    })
  })

  it('returns 400 when answers are missing', async () => {
    const res = await request(app)
      .post('/assessments/leadership')
      .send({ userId: 'user-1' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when answers length is not 12', async () => {
    const res = await request(app)
      .post('/assessments/leadership')
      .send({ userId: 'user-1', answers: [1, 2, 3] })
    expect(res.status).toBe(400)
  })

  it('returns 400 when any answer is out of range 1-10', async () => {
    const res = await request(app)
      .post('/assessments/leadership')
      .send({ userId: 'user-1', answers: [...validAnswers.slice(0, 11), 11] })
    expect(res.status).toBe(400)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await request(app)
      .post('/assessments/leadership')
      .send({ answers: validAnswers })
    expect(res.status).toBe(400)
  })
})

describe('POST /assessments/cvf', () => {
  it('returns 200 with computed CVF scores', async () => {
    const res = await request(app)
      .post('/assessments/cvf')
      .send({ userId: 'user-1', categories: validCategories })

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      userId: 'user-1',
      results: {
        clan:      240,  // 40 × 6
        adhocracy: 180,  // 30 × 6
        market:    120,  // 20 × 6
        hierarchy:  60,  // 10 × 6
      },
    })
  })

  it('returns 400 when categories are missing', async () => {
    const res = await request(app)
      .post('/assessments/cvf')
      .send({ userId: 'user-1' })
    expect(res.status).toBe(400)
  })

  it('returns 400 when fewer than 6 categories provided', async () => {
    const res = await request(app)
      .post('/assessments/cvf')
      .send({ userId: 'user-1', categories: validCategories.slice(0, 4) })
    expect(res.status).toBe(400)
  })

  it('returns 400 when a category does not sum to 100', async () => {
    const badCategory = { clan: 10, adhocracy: 10, market: 10, hierarchy: 10 }
    const res = await request(app)
      .post('/assessments/cvf')
      .send({ userId: 'user-1', categories: [...validCategories.slice(0, 5), badCategory] })
    expect(res.status).toBe(400)
  })

  it('returns 400 when userId is missing', async () => {
    const res = await request(app)
      .post('/assessments/cvf')
      .send({ categories: validCategories })
    expect(res.status).toBe(400)
  })
})
