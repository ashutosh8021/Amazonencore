import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import express from 'express'

// Mock the AI provider before importing the route
vi.mock('../services/index.js', () => ({
  gradeImage: vi.fn().mockResolvedValue({
    product: 'Wireless headphones',
    category: 'Electronics',
    grade: 'Very Good',
    confidence: 88,
    observations: ['Minor scuff on left ear cup', 'Cable intact'],
    conditionReport: 'Fully functional with light cosmetic wear.',
    co2SavedKgEstimate: 18,
  }),
  generateListing: vi.fn(),
}))

import gradeRouter from '../routes/grade.js'
import { gradeImage } from '../services/index.js'

function makeApp() {
  const app = express()
  // Larger than the route's own image limit so the route validation fires
  // (rather than body-parser rejecting the payload first).
  app.use(express.json({ limit: '20mb' }))
  app.use('/api/grade', gradeRouter)
  return app
}

const VALID_B64 = 'aGVsbG8=' // base64 of "hello" — any short string
const VALID_BODY = { imageBase64: VALID_B64, mediaType: 'image/jpeg', category: 'Electronics' }

describe('POST /api/grade — input validation', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 400 when imageBase64 is missing', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ mediaType: 'image/jpeg' })
    expect(res.status).toBe(400)
    expect(res.body.error).toBe('invalid_input')
    expect(res.body.message).toMatch(/imageBase64/)
  })

  it('returns 400 when imageBase64 is not a string (number sent)', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: 12345, mediaType: 'image/jpeg' })
    expect(res.status).toBe(400)
  })

  it('returns 413 when imageBase64 exceeds the 10 MB limit', async () => {
    const oversized = 'A'.repeat(13_981_014) // one over the 10 MB-equivalent cap
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: oversized, mediaType: 'image/jpeg' })
    expect(res.status).toBe(413)
    expect(res.body.error).toBe('image_too_large')
  })

  it('returns 400 when mediaType is missing', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: VALID_B64 })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/mediaType/)
  })

  it('returns 400 when mediaType is not an image mime type', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: VALID_B64, mediaType: 'application/pdf' })
    expect(res.status).toBe(400)
  })

  it('returns 400 for mediaType "text/plain"', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: VALID_B64, mediaType: 'text/plain' })
    expect(res.status).toBe(400)
  })

  it('accepts image/png as a valid mediaType', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: VALID_B64, mediaType: 'image/png' })
    expect(res.status).toBe(200)
  })

  it('accepts image/webp as a valid mediaType', async () => {
    const res = await request(makeApp()).post('/api/grade').send({ imageBase64: VALID_B64, mediaType: 'image/webp' })
    expect(res.status).toBe(200)
  })
})

describe('POST /api/grade — successful grading', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns 200 with the AI grading result for a valid request', async () => {
    const res = await request(makeApp()).post('/api/grade').send(VALID_BODY)
    expect(res.status).toBe(200)
    expect(res.body.grade).toBe('Very Good')
    expect(res.body.confidence).toBe(88)
  })

  it('passes imageBase64, mediaType, name, price and category through to gradeImage', async () => {
    await request(makeApp()).post('/api/grade').send({
      imageBase64: VALID_B64,
      mediaType: 'image/jpeg',
      name: 'Sony headphones',
      price: 8999,
      category: 'Electronics',
    })
    expect(gradeImage).toHaveBeenCalledWith({
      imageBase64: VALID_B64,
      mediaType: 'image/jpeg',
      name: 'Sony headphones',
      price: 8999,
      category: 'Electronics',
    })
  })

  it('returns 503 and surfaces the real error message when the AI upstream is unavailable', async () => {
    gradeImage.mockRejectedValueOnce(new Error('Bedrock API 503: Service Unavailable'))
    const res = await request(makeApp()).post('/api/grade').send(VALID_BODY)
    // Upstream 5xx / throttling maps to 503 (transient); CLAUDE.md rule 7: real message surfaced.
    expect(res.status).toBe(503)
    expect(res.body.message).toContain('Bedrock API 503')
  })

  it('returns 500 for a non-transient AI error', async () => {
    gradeImage.mockRejectedValueOnce(new Error('Unexpected parsing failure'))
    const res = await request(makeApp()).post('/api/grade').send(VALID_BODY)
    expect(res.status).toBe(500)
    expect(res.body.message).toContain('Unexpected parsing failure')
  })
})
