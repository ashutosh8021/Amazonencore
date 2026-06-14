import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import gradeRouter from './routes/grade.js'
import decideRouter from './routes/decide.js'
import listingRouter from './routes/listing.js'
import marketplaceRouter from './routes/marketplace.js'
import dashboardRouter from './routes/dashboard.js'

const app = express()
const PORT = process.env.PORT || 3001

const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL }
  : { origin: true }
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))

app.get('/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/grade', gradeRouter)
app.use('/api/decide', decideRouter)
app.use('/api/listing', listingRouter)
app.use('/api/marketplace', marketplaceRouter)
app.use('/api/dashboard', dashboardRouter)

app.listen(PORT, () => {
  console.log(`Encore server running on http://localhost:${PORT}`)
})
