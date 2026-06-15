// Sanitization helpers for user-supplied text that gets interpolated into AI prompts.
// Defends against prompt injection: strips control characters, prompt-delimiter
// characters (backticks, curly braces), and known "ignore previous instructions"
// style override patterns, then truncates to a safe length. Never throws — always
// returns a string so callers can use it inline without a try/catch.

const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
  /disregard\s+(?:all\s+)?(?:previous|prior|above)/gi,
  /forget\s+(?:everything|all|previous)/gi,
  /you\s+are\s+now\s+/gi,
  /new\s+instructions?\s*:/gi,
  /system\s*(?:prompt|message)\s*:/gi,
  /\b(?:assistant|system|user)\s*:/gi, // role-injection markers
]

// ASCII control characters (tab/newline/CR are left for the whitespace-collapse
// pass below, which turns them into single spaces). Built via hex escapes only.
const CONTROL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

/**
 * Sanitize a free-text field destined for an AI prompt.
 * @param {unknown} value - raw user input
 * @param {number} maxLen - max characters to keep (silently truncated)
 * @returns {string} safe, truncated string (empty string if input is not a string)
 */
export function sanitizePromptText(value, maxLen = 200) {
  if (typeof value !== 'string') return ''
  let s = value
    .replace(CONTROL_CHARS, '')
    .replace(/`/g, '')      // backticks (code fences / inline code)
    .replace(/[{}]/g, '')   // curly braces (JSON-structure injection)

  for (const pattern of INJECTION_PATTERNS) {
    s = s.replace(pattern, '[removed]')
  }

  // collapse runs of whitespace, trim, then truncate
  s = s.replace(/\s+/g, ' ').trim()
  return s.length > maxLen ? s.slice(0, maxLen) : s
}
