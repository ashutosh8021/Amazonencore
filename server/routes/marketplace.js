import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { storeImage } from '../lib/imageStorage.js'

const router = Router()

const fallbackStore = []

/* Extract user_id from a Supabase JWT in the Authorization header */
async function getUserId(req) {
  const auth = req.headers.authorization || ''
  if (!auth.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  if (token.split('.').length !== 3) return null  // not a JWT
  if (!supabase) return null
  try {
    const { data: { user } } = await supabase.auth.getUser(token)
    return user?.id ?? null
  } catch {
    return null
  }
}

/* POST /api/marketplace — save a new listing to Supabase */
router.post('/', async (req, res) => {
  try {
    const { title, description, conditionLabel, suggestedPrice, originalPrice,
            category, grade, confidence, observations, imageBase64, mediaType,
            additionalImages, co2SavedKg } = req.body

    if (!title) return res.status(400).json({ error: 'Title is required' })

    let imageUrl = null
    if (imageBase64) {
      imageUrl = await storeImage(imageBase64, mediaType || 'image/jpeg')
        ?? `data:${mediaType || 'image/jpeg'};base64,${imageBase64}`
    }

    const additionalUrls = []
    if (Array.isArray(additionalImages)) {
      for (const img of additionalImages.slice(0, 3)) {
        if (!img.base64) continue
        const url = await storeImage(img.base64, img.mediaType || 'image/jpeg')
          ?? `data:${img.mediaType || 'image/jpeg'};base64,${img.base64}`
        additionalUrls.push(url)
      }
    }

    const userId = await getUserId(req)

    const row = {
      title,
      description: description || '',
      category: category || 'General',
      condition_grade: conditionLabel || grade || 'Good',
      condition_score: confidence || 80,
      price: Number(suggestedPrice) || 0,
      original_price: Number(originalPrice) || 0,
      image_url: imageUrl,
      additional_images: additionalUrls,
      tag: 'Just listed',
      observations: observations || [],
      condition_summary: description || '',
      co2_saved_kg: co2SavedKg || 0,
      user_id: userId,
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

      console.log(`[marketplace] [${req.requestId}] Listed "${title}" by user ${userId ?? 'anonymous'}`)
      return res.json({ ok: true, listing: data[0] })
    }

    const item = { id: `local-${Date.now()}`, ...row, created_at: new Date().toISOString() }
    fallbackStore.unshift(item)
    console.log(`[marketplace] [${req.requestId}] Listed "${title}" in-memory (${fallbackStore.length} total)`)
    res.json({ ok: true, listing: item })
  } catch (err) {
    console.error(`[marketplace] [${req.requestId}] Error:`, err.message)
    res.status(500).json({ error: err.message })
  }
})

/* GET /api/marketplace — return all listings (public browse) */
router.get('/', async (_req, res) => {
  try {
    if (supabase) {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('[marketplace] Supabase fetch error:', error.message)
        return res.status(500).json({ error: error.message })
      }

      return res.json({ listings: data })
    }

    res.json({ listings: fallbackStore })
  } catch (err) {
    console.error('[marketplace] Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
