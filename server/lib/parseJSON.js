// Shared defensive JSON parser used by both AI service adapters.
// Strips ```json fences, slices from first { to last }, then parses.
export function parseJSON(raw) {
  let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) {
    throw new Error(`No JSON object found in AI response: ${text.slice(0, 200)}`)
  }
  return JSON.parse(text.slice(start, end + 1))
}
