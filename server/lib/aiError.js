// Maps an error thrown by an AI service call to an appropriate HTTP status.
// Timeouts and upstream unavailability → 503 (transient, client may retry);
// everything else → 500. The real error message is still surfaced to the client
// per CLAUDE.md rule 7 so AI failures stay debuggable during the demo.
export function aiErrorStatus(err) {
  const name = err?.name || ''
  const msg = String(err?.message || '')
  const isTimeout = name === 'TimeoutError' || name === 'AbortError' || /timed?\s*out|timeout/i.test(msg)
  const isUpstreamDown = /\b(429|500|502|503|504)\b/.test(msg) || /service unavailable|throttl/i.test(msg)
  return (isTimeout || isUpstreamDown) ? 503 : 500
}
