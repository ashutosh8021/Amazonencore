import { Router } from 'express'
import { createRequire } from 'module'
import { generateListing } from '../services/index.js'
import { validateName, validateGrade, validatePrice } from '../lib/validate.js'
import { aiErrorStatus } from '../lib/aiError.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

router.post('/', async (req, res) => {
  const { product, grade, observations, price } = req.body || {}

  // ── validate request body ──
  const prod = validateName(product, { required: true })
  if (!prod.ok) return res.status(400).json({ error: 'invalid_input', message: prod.message.replace('name', 'product') })

  const gr = validateGrade(grade, { required: false })
  if (!gr.ok) return res.status(400).json({ error: 'invalid_input', message: gr.message })

  const pr = validatePrice(price)
  if (!pr.ok) return res.status(400).json({ error: 'invalid_input', message: pr.message })

  if (observations != null && !Array.isArray(observations)) {
    return res.status(400).json({ error: 'invalid_input', message: 'observations must be an array.' })
  }

  // Demo cache lookup by product (case-insensitive)
  const cached = demoCache.find(entry => entry.name.toLowerCase() === prod.value.toLowerCase())
  if (cached && cached.listing) {
    res.set('x-encore-cached', 'true')
    return res.json(cached.listing)
  }

  try {
    const result = await generateListing({
      product: prod.value,
      grade: gr.value,
      observations: observations || [],
      price: pr.value,
    })
    res.json(result)
  } catch (err) {
    console.error(`[/api/listing] [${req.requestId}]`, err)
    res.status(aiErrorStatus(err)).json({ error: 'ai_error', message: err.message })
  }
})

export default router
