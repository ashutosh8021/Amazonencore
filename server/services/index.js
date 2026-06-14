// Provider switch — set AI_PROVIDER in .env to select the AI backend; default is Groq.
import * as groq from './groq.js'
import * as bedrock from './bedrock.js'
import * as bedrockSdk from './bedrock-sdk.js'

const provider = (process.env.AI_PROVIDER || 'groq').toLowerCase()

function selectService(provider) {
  switch (provider) {
    case 'bedrock-sdk':
      return bedrockSdk
    case 'bedrock':
    case 'bedrock-bearer':
      return bedrock
    case 'groq':
    default:
      return groq
  }
}

const service = selectService(provider)

console.log(`[AI] provider: ${provider}`)

export const gradeImage = service.gradeImage
export const generateListing = service.generateListing
