const BASE_URL = import.meta.env.VITE_API_URL || ''

async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

export const gradeImage = (body) => post('grade', body)
export const decide = (body) => post('decide', body)
export const generateListing = (body) => post('listing', body)

/* ── marketplace ─────────────────────────────────────────────────── */
export const publishListing = (body) => post('marketplace', body)
export const fetchUserListings = () => get('marketplace')
