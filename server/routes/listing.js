import { Router } from 'express'
import { createRequire } from 'module'
import { generateListing } from '../services/index.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

router.post('/', async (req, res) => {
  try {
    // Demo cache lookup by product (case-insensitive)
    const { product } = req.body
    if (product) {
      const cached = demoCache.find(
        entry => entry.name.toLowerCase() === product.toLowerCase()
      )
      if (cached && cached.listing) {
        res.set('x-encore-cached', 'true')
        return res.json(cached.listing)
      }
    }

    const result = await generateListing(req.body)
    res.json(result)
  } catch (err) {
    console.error('[/api/listing]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
