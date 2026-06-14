import { Router } from 'express'
import { createRequire } from 'module'
import { gradeImage } from '../services/index.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

function findCachedDemo({ name }) {
  if (!name) return null
  return demoCache.find(entry => entry.name.toLowerCase() === name.toLowerCase()) ?? null
}

// ~4 MB limit — base64 is 4/3× the raw size, so 4 MB actual ≈ 5.5 MB of base64 text
const MAX_B64_LEN = 5_500_000

router.post('/', async (req, res) => {
  const { imageBase64, mediaType, name, price, category } = req.body

  if (!imageBase64 || typeof imageBase64 !== 'string') {
    return res.status(400).json({ error: 'imageBase64 is required' })
  }
  if (imageBase64.length > MAX_B64_LEN) {
    return res.status(413).json({
      error: 'image_too_large',
      message: 'Image is too large (max 4 MB). Please compress the photo or use a different image.',
    })
  }
  if (!mediaType || !String(mediaType).startsWith('image/')) {
    return res.status(400).json({ error: 'mediaType must be an image MIME type (e.g. image/jpeg)' })
  }

  const cached = findCachedDemo(req.body)
  if (cached) {
    res.set('x-encore-cached', 'true')
    return res.json(cached.grade)
  }

  try {
    const result = await gradeImage({ imageBase64, mediaType, name, price, category })
    res.json(result)
  } catch (err) {
    console.error(`[/api/grade] [${req.requestId}]`, err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
