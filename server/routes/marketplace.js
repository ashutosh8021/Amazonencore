import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { storeImage } from '../lib/imageStorage.js'
import { requireWriteToken } from '../middleware/writeAuth.js'

const router = Router()

/* ── in-memory fallback if Supabase is not configured ────────────── */
const fallbackStore = []

/* POST /api/marketplace — save a new listing to Supabase */
router.post('/', requireWriteToken, async (req, res) => {
  try {
    const { title, description, conditionLabel, suggestedPrice, originalPrice,
            category, grade, confidence, observations, imageBase64, mediaType,
            co2SavedKg } = req.body

    if (!title) return res.status(400).json({ error: 'Title is required' })

    // Try Supabase Storage first; fall back to inline data URI to avoid
    // storing large base64 blobs as row values.
    let imageUrl = null
    if (imageBase64) {
      imageUrl = await storeImage(imageBase64, mediaType || 'image/jpeg')
        ?? `data:${mediaType || 'image/jpeg'};base64,${imageBase64}`
    }

    const row = {
      title,
      description: description || '',
      category: category || 'General',
      condition_grade: conditionLabel || grade || 'Good',
      condition_score: confidence || 80,
      price: Number(suggestedPrice) || 0,
      original_price: Number(originalPrice) || 0,
      image_url: imageUrl,
      tag: 'Just listed',
      observations: observations || [],
      condition_summary: description || '',
      co2_saved_kg: co2SavedKg || 0,
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .insert([row])
        .select()

      if (error) {
        console.error(`[marketplace] [${req.requestId}] Supabase insert error:`, error.message)
        return res.status(500).json({ error: error.message })
      }

      console.log(`[marketplace] [${req.requestId}] Listed "${title}" to Supabase`)
      return res.json({ ok: true, listing: data[0] })
    }

    // fallback: in-memory
    const item = { id: `local-${Date.now()}`, ...row, created_at: new Date().toISOString() }
    fallbackStore.unshift(item)
    console.log(`[marketplace] [${req.requestId}] Listed "${title}" in-memory (${fallbackStore.length} total)`)
    res.json({ ok: true, listing: item })
  } catch (err) {
    console.error(`[marketplace] [${req.requestId}] Error:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

/* GET /api/marketplace — return all user-listed items */
router.get('/', async (_req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('[marketplace] Supabase fetch error:', error.message)
        return res.status(500).json({ error: error.message })
      }

      return res.json({ listings: data })
    }

    // fallback
    res.json({ listings: fallbackStore })
  } catch (err) {
    console.error('[marketplace] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
