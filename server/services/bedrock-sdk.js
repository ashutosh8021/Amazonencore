// Bedrock SDK integration — IAM credential auth, native Anthropic content blocks
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { parseJSON } from '../lib/parseJSON.js'

const client = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function invokeModel(messages) {
  const modelId = process.env.BEDROCK_MODEL_ID
  const body = JSON.stringify({
    anthropic_version: 'bedrock-2023-05-31',
    max_tokens: 700,
    temperature: 0.2,
    messages,
  })

  const command = new InvokeModelCommand({
    modelId,
    contentType: 'application/json',
    accept: 'application/json',
    body,
  })

  let response
  try {
    response = await client.send(command)
  } catch (err) {
    throw new Error(`Bedrock SDK ${err.$metadata?.httpStatusCode || 'unknown'}: ${err.message}`)
  }

  const result = JSON.parse(new TextDecoder().decode(response.body))
  return result.content[0].text
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

  const content = await invokeModel([
    {
      role: 'user',
      content: [
        { type: 'text', text: prompt },
        {
          type: 'image',
          source: { type: 'base64', media_type: mediaType, data: imageBase64 },
        },
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

  const content = await invokeModel([{ role: 'user', content: [{ type: 'text', text: prompt }] }])
  return parseJSON(content)
}
