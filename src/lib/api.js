import { supabase } from './supabase.js'

const BASE_URL = import.meta.env.VITE_API_URL || ''

export const API_BASE_URL = BASE_URL || window.location.origin

async function post(endpoint, body, { requestId, writeToken } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (requestId) headers['X-Request-Id'] = requestId
  if (writeToken) headers['Authorization'] = `Bearer ${writeToken}`

  const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    let parsed = null
    try { parsed = JSON.parse(text) } catch { /* not JSON */ }
    const err = new Error(parsed?.message || parsed?.error || text || `HTTP ${res.status}`)
    err.status = res.status
    err.code = parsed?.error ?? null
    throw err
  }
  return res.json()
}

async function get(endpoint) {
  const res = await fetch(`${BASE_URL}/api/${endpoint}`)
  if (!res.ok) {
    const text = await res.text()
    let parsed = null
    try { parsed = JSON.parse(text) } catch { /* not JSON */ }
    const err = new Error(parsed?.message || parsed?.error || text || `HTTP ${res.status}`)
    err.status = res.status
    err.code = parsed?.error ?? null
    throw err
  }
  return res.json()
}

export const gradeImage      = (body, opts) => post('grade',   body, opts)
export const decide          = (body, opts) => post('decide',  body, opts)
export const generateListing = (body, opts) => post('listing', body, opts)
export const healthCheck = () =>
  fetch(`${BASE_URL}/health`).then(r => { if (!r.ok) throw new Error('unhealthy'); return r.json() })

/* ── marketplace ─────────────────────────────────────────────────── */
export async function publishListing(body, opts = {}) {
  // Prefer the logged-in user's JWT; fall back to static write token.
  let writeToken = import.meta.env.VITE_MARKETPLACE_WRITE_TOKEN
  if (supabase) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) writeToken = session.access_token
  }
  return post('marketplace', body, { ...opts, writeToken: writeToken || undefined })
}

export const fetchUserListings = () => get('marketplace')
