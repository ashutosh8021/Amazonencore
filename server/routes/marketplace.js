import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { storeImage } from '../lib/imageStorage.js'
import { requireWriteToken } from '../middleware/writeAuth.js'
import { validateName, validatePrice, validateCategory, validateGrade, MAX_IMAGE_B64_LEN } from '../lib/validate.js'

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

/* POST /api/marketplace — save a new listing to Supabase (write-guarded) */
router.post('/', requireWriteToken, async (req, res) => {
  try {
    const { title, description, conditionLabel, suggestedPrice, originalPrice,
            category, grade, confidence, observations, imageBase64, mediaType,
            additionalImages, co2SavedKg } = req.body || {}

    // ── validate request body ──
    const t = validateName(title, { required: true, max: 300 })
    if (!t.ok) return res.status(400).json({ error: 'invalid_input', message: t.message.replace('name', 'title') })

    const cat = validateCategory(category)
    if (!cat.ok) return res.status(400).json({ error: 'invalid_input', message: cat.message })

    const sp = validatePrice(suggestedPrice)
    if (!sp.ok) return res.status(400).json({ error: 'invalid_input', message: sp.message.replace('price', 'suggestedPrice') })

    const op = validatePrice(originalPrice)
    if (!op.ok) return res.status(400).json({ error: 'invalid_input', message: op.message.replace('price', 'originalPrice') })

    const gr = validateGrade(conditionLabel || grade, { required: false })
    if (!gr.ok) return res.status(400).json({ error: 'invalid_input', message: gr.message })

    if (typeof imageBase64 === 'string' && imageBase64.length > MAX_IMAGE_B64_LEN) {
      return res.status(413).json({ error: 'invalid_input', message: 'Image is too large (max 10 MB).' })
    }

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
      title: t.value,
      description: description || '',
      category: cat.value || 'General',
      condition_grade: gr.value || 'Good',
      condition_score: confidence || 80,
      price: sp.value || 0,
      original_price: op.value || 0,
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
        console.error(`[marketplace] [${req.requestId}] Supabase insert error:`, error)
        return res.status(500).json({ error: 'server_error', message: 'Could not save the listing. Please try again.' })
      }

      console.log(`[marketplace] [${req.requestId}] Listed "${t.value}" by user ${userId ?? 'anonymous'}`)
      return res.json({ ok: true, listing: data[0] })
    }

    const item = { id: `local-${Date.now()}`, ...row, created_at: new Date().toISOString() }
    fallbackStore.unshift(item)
    console.log(`[marketplace] [${req.requestId}] Listed "${t.value}" in-memory (${fallbackStore.length} total)`)
    res.json({ ok: true, listing: item })
  } catch (err) {
    console.error(`[marketplace] [${req.requestId}] Error:`, err)
    res.status(500).json({ error: 'server_error', message: 'Could not save the listing. Please try again.' })
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
        console.error('[marketplace] Supabase fetch error:', error)
        return res.status(500).json({ error: 'server_error', message: 'Could not load listings.' })
      }

      return res.json({ listings: data })
    }

    res.json({ listings: fallbackStore })
  } catch (err) {
    console.error('[marketplace] Error:', err)
    res.status(500).json({ error: 'server_error', message: 'Could not load listings.' })
  }
})

export default router
