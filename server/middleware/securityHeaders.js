// Hardens HTTP response headers. Equivalent to the core protections helmet
// provides, implemented inline to honour the project's "no new dependencies"
// rule (CLAUDE.md §5). Applied globally in index.js.
export function securityHeaders(_req, res, next) {
  // Prevent MIME-type sniffing
  res.set('X-Content-Type-Options', 'nosniff')
  // Disallow framing (clickjacking protection)
  res.set('X-Frame-Options', 'DENY')
  // Don't leak the full URL as referrer to other origins
  res.set('Referrer-Policy', 'no-referrer')
  // This is a JSON API — lock down what a response is ever allowed to load
  res.set('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'")
  // Disable powerful browser features by default
  res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
  // Hide the Express fingerprint
  res.removeHeader('X-Powered-By')
  next()
}
