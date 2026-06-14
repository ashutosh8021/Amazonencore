import { Router } from 'express'
import { createRequire } from 'module'
import { decide } from '../lib/disposition.js'
import { supabase } from '../lib/supabase.js'

const require = createRequire(import.meta.url)
const demoCache = require('../data/demo-cache.json')

const router = Router()

const CONFIDENCE_THRESHOLD = 50

router.post('/', (req, res) => {
  try {
    const { grade, price, category, confidence, name } = req.body

    // Demo cache lookup by name (case-insensitive)
    if (name) {
      const cached = demoCache.find(
        entry => entry.name.toLowerCase() === name.toLowerCase()
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

    const result = decide({ originalPrice: price, grade, category, confidence })
    res.json(result)

    // fire-and-forget — log every decision to Supabase for the dashboard
    if (supabase) {
      supabase.from('processed_items').insert([{
        title: name || 'Unnamed item',
        category: category || 'General',
        condition_grade: grade,
        decision: result.decision,
        original_price: price || 0,
        net_resell: result.netResell,
        net_carbon_saved_kg: result.netCarbonSavedKg,
        green_credits: result.greenCredits,
      }]).then(({ error }) => {
        if (error) console.error(`[decide] [${req.requestId}] Supabase log error:`, error.message)
      })
    }
  } catch (err) {
    console.error(`[/api/decide] [${req.requestId}]`, err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router
