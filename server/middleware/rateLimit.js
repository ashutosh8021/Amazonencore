// Simple in-memory rate limiter — no extra package needed.
// Suitable for a single-process Railway deployment.
const store = new Map()

// Prune expired entries every 5 minutes so the map doesn't grow forever.
setInterval(() => {
  const now = Date.now()
  for (const [key, rec] of store) {
    if (now > rec.resetAt) store.delete(key)
  }
}, 5 * 60 * 1000).unref()

export function rateLimit({ windowMs = 60_000, max = 10 } = {}) {
  return (req, res, next) => {
    const key = req.ip || 'unknown'
    const now = Date.now()
    let rec = store.get(key)

    if (!rec || now > rec.resetAt) {
      rec = { count: 0, resetAt: now + windowMs }
    }

    rec.count++
    store.set(key, rec)

    if (rec.count > max) {
      return res.status(429).json({
        error: 'rate_limit_exceeded',
        message: 'Too many requests. Please wait a moment before trying again.',
        retryAfter: Math.ceil((rec.resetAt - now) / 1000),
      })
    }

    next()
  }
}
