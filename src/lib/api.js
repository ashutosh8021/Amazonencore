import { supabase } from './supabase.js'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export const API_BASE_URL = BASE_URL || window.location.origin

// Build a typed Error from a non-2xx response, parsing JSON defensively.
async function errorFromResponse(res) {
  let text = ''
  try { text = await res.text() } catch { /* body unreadable */ }
  let parsed = null
  try { parsed = JSON.parse(text) } catch { /* not JSON */ }
  const err = new Error(parsed?.message || parsed?.error || text || `HTTP ${res.status}`)
  err.status = res.status
  err.code = parsed?.error ?? null
  return err
}

// Wraps fetch so a network failure (DNS, offline, CORS, timeout) becomes a typed
// error with code 'network_error' instead of an uncaught TypeError.
async function safeFetch(url, options) {
  try {
    return await fetch(url, options)
  } catch (cause) {
    const err = new Error('Could not reach the Encore server. Check your connection and try again.')
    err.status = 0
    err.code = 'network_error'
    err.cause = cause
    throw err
  }
}

// Parse a 2xx body as JSON, guarding against an empty/non-JSON response.
async function parseJsonBody(res) {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    const err = new Error('The server returned an unexpected (non-JSON) response.')
    err.status = res.status
    err.code = 'bad_response'
    throw err
  }
}

async function post(endpoint, body, { requestId, writeToken } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (requestId) headers['X-Request-Id'] = requestId
  if (writeToken) headers['Authorization'] = `Bearer ${writeToken}`

  const res = await safeFetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) throw await errorFromResponse(res)
  return parseJsonBody(res)
}

async function get(endpoint) {
  const res = await safeFetch(`${BASE_URL}/api/${endpoint}`)
  if (!res.ok) throw await errorFromResponse(res)
  return parseJsonBody(res)
}

export const gradeImage      = (body, opts) => post('grade',   body, opts)
export const decide          = (body, opts) => post('decide',  body, opts)
export const generateListing = (body, opts) => post('listing', body, opts)
export const healthCheck = () =>
  safeFetch(`${BASE_URL}/health`).then(r => { if (!r.ok) throw new Error('unhealthy'); return parseJsonBody(r) })

/* ── marketplace ─────────────────────────────────────────────────── */
export async function publishListing(body, opts = {}) {
  // Prefer the logged-in user's JWT; fall back to static write token.
  let writeToken = import.meta.env.VITE_MARKETPLACE_WRITE_TOKEN
  if (supabase) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) writeToken = session.access_token
    } catch { /* session fetch failed — fall back to static token */ }
  }
  return post('marketplace', body, { ...opts, writeToken: writeToken || undefined })
}

export const fetchUserListings = () => get('marketplace')
