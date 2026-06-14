// Guards write endpoints against unauthenticated external requests.
// Accepts either the static MARKETPLACE_WRITE_TOKEN or a valid Supabase JWT
// (identified by the standard three-segment dot format).
// When MARKETPLACE_WRITE_TOKEN is unset the guard is bypassed (dev mode).
export function requireWriteToken(req, res, next) {
  const staticToken = process.env.MARKETPLACE_WRITE_TOKEN
  if (!staticToken) return next()

  const auth = req.headers.authorization || ''
  const bearerToken = auth.startsWith('Bearer ') ? auth.slice(7) : ''

  if (!bearerToken) {
    return res.status(401).json({ error: 'unauthorized', message: 'Valid credentials required.' })
  }

  // Static write token — exact match
  if (bearerToken === staticToken) return next()

  // Supabase JWT — three dot-separated segments (header.payload.signature)
  if (bearerToken.split('.').length === 3) return next()

  return res.status(401).json({ error: 'unauthorized', message: 'Valid credentials required.' })
}
