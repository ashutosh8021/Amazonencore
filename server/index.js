import 'dotenv/config'
import { randomUUID } from 'crypto'
import express from 'express'
import cors from 'cors'
import gradeRouter from './routes/grade.js'
import decideRouter from './routes/decide.js'
import listingRouter from './routes/listing.js'
import marketplaceRouter from './routes/marketplace.js'
import dashboardRouter from './routes/dashboard.js'
import { rateLimit } from './middleware/rateLimit.js'

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : { origin: true }
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

// Attach a correlation ID to every request and echo it back in the response.
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID()
  res.set('X-Request-Id', req.requestId)
  next()
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// AI-heavy routes — 10 calls per IP per minute to prevent billing abuse.
const aiLimit = rateLimit({ windowMs: 60_000, max: 10 })

app.use('/api/grade',       aiLimit, gradeRouter)
app.use('/api/listing',     aiLimit, listingRouter)
app.use('/api/decide',      decideRouter)
app.use('/api/marketplace', marketplaceRouter)
app.use('/api/dashboard',   dashboardRouter)

const server = app.listen(PORT, () => {
  console.log(`Encore server running on http://localhost:${PORT}`)
})

// Give in-flight requests up to 10 s to finish before forcing exit.
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('[server] Closed. Exiting.')
    process.exit(0)
  })
  setTimeout(() => process.exit(0), 10_000).unref()
})
