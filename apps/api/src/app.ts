import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { assessmentsRouter } from './routes/assessments.js'
import { peerAssessmentsRouter } from './routes/peer-assessments.js'

export function createApp(): Express {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.use('/assessments', assessmentsRouter)
  app.use('/peer-assessments', peerAssessmentsRouter)

  return app
}
