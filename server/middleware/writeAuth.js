// Guards write endpoints against unauthenticated external requests.
// When MARKETPLACE_WRITE_TOKEN is unset the guard is bypassed (dev mode).
export function requireWriteToken(req, res, next) {
  const token = process.env.MARKETPLACE_WRITE_TOKEN
  if (!token) return next()

  const auth = req.headers.authorization || ''
  if (auth !== `Bearer ${token}`) {
    return res.status(401).json({ error: 'unauthorized', message: 'Valid write token required.' })
  }
  next()
}
