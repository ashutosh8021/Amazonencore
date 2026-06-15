import { Router } from 'express'
import { createRequire } from 'module'
import { gradeImage } from '../services/index.js'
import { validateImageBase64, validateMediaType, validateName, validatePrice, validateCategory } from '../lib/validate.js'
import { aiErrorStatus } from '../lib/aiError.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

function findCachedDemo({ name }) {
  if (!name) return null
  return demoCache.find(entry => entry.name.toLowerCase() === name.toLowerCase()) ?? null
}

router.post('/', async (req, res) => {
  const { imageBase64, mediaType, name, price, category } = req.body || {}

  // ── validate request body ──
  const img = validateImageBase64(imageBase64)
  if (!img.ok) {
    // Oversized payloads get a distinct 413 + code so the client can react specifically.
    const tooLarge = typeof imageBase64 === 'string' && imageBase64.length > 0
    return res
      .status(tooLarge ? 413 : 400)
      .json({ error: tooLarge ? 'image_too_large' : 'invalid_input', message: img.message })
  }

  const mt = validateMediaType(mediaType)
  if (!mt.ok) return res.status(400).json({ error: 'invalid_input', message: mt.message })

  const nm = validateName(name)
  if (!nm.ok) return res.status(400).json({ error: 'invalid_input', message: nm.message })

  const pr = validatePrice(price)
  if (!pr.ok) return res.status(400).json({ error: 'invalid_input', message: pr.message })

  const cat = validateCategory(category)
  if (!cat.ok) return res.status(400).json({ error: 'invalid_input', message: cat.message })

  const cached = findCachedDemo(req.body)
  if (cached) {
    res.set('x-encore-cached', 'true')
    return res.json(cached.grade)
  }

  try {
    const result = await gradeImage({
      imageBase64: img.value,
      mediaType: mt.value,
      name: nm.value,
      price: pr.value,
      category: cat.value,
    })
    res.json(result)
  } catch (err) {
    // CLAUDE.md rule 7: surface the real AI error so failures are debuggable.
    console.error(`[/api/grade] [${req.requestId}]`, err)
    res.status(aiErrorStatus(err)).json({ error: 'ai_error', message: err.message })
  }
})

export default router
