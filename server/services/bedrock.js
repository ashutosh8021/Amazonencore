// Bedrock OpenAI-compatible endpoint — bearer-token auth, same interface as groq.js
import { parseJSON } from '../lib/parseJSON.js'

function bedrockUrl() {
  const region = process.env.AWS_REGION || 'us-east-1'
  return `https://bedrock-runtime.${region}.amazonaws.com/openai/v1/chat/completions`
}

async function callBedrock(messages) {
  const url = bedrockUrl()
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AWS_BEARER_TOKEN_BEDROCK}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.BEDROCK_MODEL_ID,
      messages,
      temperature: 0.2,
      max_tokens: 700,
    }),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Bedrock API ${res.status}: ${body}`)
  }

  const data = await res.json()
  return data.choices[0].message.content
}

export async function gradeImage({ imageBase64, mediaType, name, price, category }) {
  const context = [
    name ? `Product name: ${name}` : null,
    price ? `Original price: ₹${price}` : null,
    category ? `Category: ${category}` : null,
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

  const content = await callBedrock([
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

Product: ${product}
Grade: ${grade}
Observed flaws/notes: ${(observations || []).join(', ')}
${price ? `Suggested price: ₹${price}` : ''}

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

  const content = await callBedrock([{ role: 'user', content: prompt }])
  return parseJSON(content)
}
