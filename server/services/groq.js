/**
 * Groq AI Provider (Llama model)
 *
 * IMPORTANT: The configured Llama model does not reliably support vision/image
 * inputs. The gradeImage function may produce inaccurate or hallucinated results
 * when processing images through this provider. For production image grading,
 * use AI_PROVIDER=bedrock-sdk which supports native multimodal vision via
 * Amazon Bedrock (Claude).
 */
import { parseJSON } from '../lib/parseJSON.js'
import { sanitizePromptText } from '../lib/sanitize.js'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function callGroq(messages) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    signal: AbortSignal.timeout(30_000),
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL_ID,
      messages,
      temperature: 0.2,
      max_tokens: 700,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Groq API ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

export async function gradeImage({ imageBase64, mediaType, name, price, category }) {
  const safeName = sanitizePromptText(name, 200)
  const safeCategory = sanitizePromptText(category, 100)
  const safePrice = Number.isFinite(Number(price)) && Number(price) > 0 ? Math.round(Number(price)) : null
  const context = [
    safeName ? `Product name: ${safeName}` : null,
    safePrice ? `Original price: ₹${safePrice}` : null,
    safeCategory ? `Category: ${safeCategory}` : null,
  ].filter(Boolean).join('. ')

  const prompt = `You are an Amazon warehouse quality-grading AI. Inspect the product in the image carefully.
${context ? `Context provided: ${context}.` : ''}

Grade the item using Amazon's exact four-tier condition scale:
- "Like New": looks brand new, no signs of use, original packaging intact
- "Very Good": minor signs of use, fully functional, no significant defects
- "Good": visible wear or minor defects, fully functional
- "Acceptable": heavy wear, possible cosmetic damage, still functional
- "Not Sellable": broken, missing critical parts, or unsafe

Return ONLY valid JSON, no markdown, no commentary. Exactly these keys:
{
  "product": "short product name",
  "category": "product category",
  "grade": "Like New|Very Good|Good|Acceptable|Not Sellable",
  "confidence": <integer 0-100>,
  "observations": ["up to 4 short condition notes about specific flaws or positives"],
  "conditionReport": "one plain-English sentence summarising condition",
  "co2SavedKgEstimate": <number, kg CO2 saved vs landfill, based on category>
}`

  console.warn('[AI] Warning: Groq/Llama vision support is unreliable for image grading. Consider using AI_PROVIDER=bedrock-sdk for production.')

  const content = await callGroq([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: `data:${mediaType};base64,${imageBase64}` } },
      ],
    },
  ])

  return parseJSON(content)
}

export async function generateListing({ product, grade, observations, price }) {
  const prompt = `You are an Amazon marketplace listing writer. Write an honest, condition-accurate product listing.

Product: ${sanitizePromptText(product, 200)}
Grade: ${grade}
Observed flaws/notes: ${(observations || []).map(o => sanitizePromptText(o, 120)).filter(Boolean).join(', ')}
${Number.isFinite(Number(price)) && Number(price) > 0 ? `Suggested price: ₹${Math.round(Number(price))}` : ''}

Rules:
- The description MUST mention the actual observed flaws — do not hide them
- Description must be 30 words or fewer
- Be reassuring but honest — this builds buyer trust
- Sentence case, no emojis

Return ONLY valid JSON, no markdown:
{
  "title": "concise listing title including condition",
  "description": "≤30 words, names real flaws",
  "conditionLabel": "${grade}"
}`

  const content = await callGroq([{ role: 'user', content: prompt }])
  return parseJSON(content)
}
