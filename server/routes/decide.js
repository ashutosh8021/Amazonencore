import { Router } from 'express'
import { createRequire } from 'module'
import { decide } from '../lib/disposition.js'
import { supabase } from '../lib/supabase.js'
import { validateGrade, validatePrice, validateCategory, validateName } from '../lib/validate.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

const CONFIDENCE_THRESHOLD = 50

router.post('/', (req, res) => {
  try {
    const { grade, price, category, confidence, name } = req.body || {}

    // ── validate request body ──
    const gr = validateGrade(grade, { required: true })
    if (!gr.ok) return res.status(400).json({ error: 'invalid_input', message: gr.message })

    const pr = validatePrice(price)
    if (!pr.ok) return res.status(400).json({ error: 'invalid_input', message: pr.message })

    const cat = validateCategory(category)
    if (!cat.ok) return res.status(400).json({ error: 'invalid_input', message: cat.message })

    const nm = validateName(name)
    if (!nm.ok) return res.status(400).json({ error: 'invalid_input', message: nm.message })

    if (confidence != null && (typeof confidence !== 'number' || confidence < 0 || confidence > 100)) {
      return res.status(400).json({ error: 'invalid_input', message: 'confidence must be a number between 0 and 100.' })
    }

    // Demo cache lookup by name (case-insensitive)
    if (nm.value) {
      const cached = demoCache.find(
        entry => entry.name.toLowerCase() === nm.value.toLowerCase()
      )
      if (cached && cached.decide) {
        res.set('x-encore-cached', 'true')
        return res.json(cached.decide)
      }
    }

    if (typeof confidence === 'number' && confidence < CONFIDENCE_THRESHOLD) {
      return res.status(422).json({
        error: 'low_confidence',
        message: `AI confidence is only ${confidence}% — below the ${CONFIDENCE_THRESHOLD}% threshold needed to route safely. Please upload a clearer, better-lit photo.`,
        confidence,
      })
    }

    const result = decide({ originalPrice: pr.value, grade: gr.value, category: cat.value, confidence })
    res.json(result)

    // fire-and-forget — log every decision to Supabase for the dashboard
    if (supabase) {
      supabase.from('processed_items').insert([{
        title: nm.value || 'Unnamed item',
        category: cat.value || 'General',
        condition_grade: gr.value,
        decision: result.decision,
        original_price: pr.value || 0,
        net_resell: result.netResell,
        net_carbon_saved_kg: result.netCarbonSavedKg,
        green_credits: result.greenCredits,
      }]).then(({ error }) => {
        if (error) console.error(`[decide] [${req.requestId}] Supabase log error:`, error.message)
      })
    }
  } catch (err) {
    // Our own deterministic logic — never leak internals to the client.
    console.error(`[/api/decide] [${req.requestId}]`, err)
    res.status(500).json({ error: 'server_error', message: 'Could not compute a decision. Please try again.' })
  }
})

export default router
