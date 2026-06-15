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
import { securityHeaders } from './middleware/securityHeaders.js'

const app = express()
const PORT = process.env.PORT || 3001

// ── CORS: restrict to an explicit allowlist in production ──
// ALLOWED_ORIGINS is a comma-separated list (e.g. the Amplify/Vercel URL).
// FRONTEND_URL is still honoured for backward compatibility. localhost dev
// origins are always allowed. When nothing is configured, all origins are
// allowed (local development only).
const allowlist = [
  ...(process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL.trim()] : []),
]
const localhostRe = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/

const corsOptions = allowlist.length === 0
  ? { origin: true } // dev: reflect any origin
  : {
      origin(origin, cb) {
        // allow same-origin / curl (no Origin header) and localhost dev
        if (!origin || localhostRe.test(origin) || allowlist.includes(origin)) {
          return cb(null, true)
        }
        return cb(new Error('Not allowed by CORS'))
      },
    }

app.disable('x-powered-by')
app.use(securityHeaders)
app.use(cors(corsOptions))
app.use(express.json({ limit: '15mb' }))

// Attach a correlation ID to every request and echo it back in the response.
app.use((req, res, next) => {
  req.requestId = req.headers['x-request-id'] || randomUUID()
  res.set('X-Request-Id', req.requestId)
  next()
})

app.get('/health', (_req, res) => res.json({ status: 'ok' }))

// AI-heavy routes — 20 calls per IP per minute to prevent billing abuse.
const aiLimit = rateLimit({ windowMs: 60_000, max: 20 })

app.use('/api/grade',       aiLimit, gradeRouter)
app.use('/api/listing',     aiLimit, listingRouter)
app.use('/api/decide',      decideRouter)
app.use('/api/marketplace', marketplaceRouter)
app.use('/api/dashboard',   dashboardRouter)

// ── Global error handler — last line of defence ──
// Never leak a stack trace to the client; log it server-side instead.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error(`[server] [${req?.requestId}] Unhandled route error:`, err)
  if (res.headersSent) return
  const status = err?.message === 'Not allowed by CORS' ? 403 : 500
  res.status(status).json({ error: 'server_error', message: 'Something went wrong. Please try again.' })
})

const server = app.listen(PORT, () => {
  console.log(`Encore server running on http://localhost:${PORT}`)
})

// Log unhandled async failures but keep the process alive — a single bad
// request must not take the whole server down mid-demo.
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled promise rejection:', reason)
})
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err)
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
