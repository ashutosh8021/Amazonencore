import { describe, it, expect } from 'vitest'
import request from 'supertest'
import express from 'express'
import decideRouter from '../routes/decide.js'

function makeApp() {
  const app = express()
  app.use(express.json())
  app.use('/api/decide', decideRouter)
  return app
}

const BASE = { grade: 'Like New', price: 15000, category: 'Electronics' }

describe('POST /api/decide — confidence gate', () => {
  it('returns 422 with low_confidence error when confidence is below 50', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 30 })
    expect(res.status).toBe(422)
    expect(res.body.error).toBe('low_confidence')
    expect(res.body.confidence).toBe(30)
  })

  it('returns 422 at exactly 49% confidence', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 49 })
    expect(res.status).toBe(422)
  })

  it('returns 422 at 0% confidence (completely uncertain image)', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 0 })
    expect(res.status).toBe(422)
  })

  it('passes through at exactly 50% confidence (threshold boundary)', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 50 })
    expect(res.status).toBe(200)
    expect(res.body.decision).toBeDefined()
  })

  it('passes through at 100% confidence', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 100 })
    expect(res.status).toBe(200)
  })

  it('passes through when confidence is not provided (legacy / non-vision models)', async () => {
    const res = await request(makeApp()).post('/api/decide').send(BASE)
    expect(res.status).toBe(200)
  })

  it('low_confidence response body includes a human-readable message', async () => {
    const res = await request(makeApp()).post('/api/decide').send({ ...BASE, confidence: 20 })
    expect(res.body.message).toMatch(/20%/)
    expect(res.body.message).toMatch(/50%/)
  })
})

describe('POST /api/decide — routing decisions via real engine', () => {
  it('routes ₹500 Footwear Good to Donate', async () => {
    const res = await request(makeApp()).post('/api/decide').send({
      grade: 'Good', price: 500, category: 'Footwear', confidence: 80,
    })
    expect(res.status).toBe(200)
    expect(res.body.decision).toBe('Donate')
    expect(res.body.netResell).toBe(-50)
  })

  it('routes ₹15000 Electronics Like New to Resell', async () => {
    const res = await request(makeApp()).post('/api/decide').send({
      grade: 'Like New', price: 15000, category: 'Electronics', confidence: 95,
    })
    expect(res.status).toBe(200)
    expect(res.body.decision).toBe('Resell')
    expect(res.body.netResell).toBeGreaterThan(0)
  })

  it('routes Not Sellable item to Recycle regardless of price', async () => {
    const res = await request(makeApp()).post('/api/decide').send({
      grade: 'Not Sellable', price: 50000, category: 'Electronics', confidence: 90,
    })
    expect(res.status).toBe(200)
    expect(res.body.decision).toBe('Recycle')
  })

  it('response includes green credits and carbon fields', async () => {
    const res = await request(makeApp()).post('/api/decide').send({
      grade: 'Like New', price: 15000, category: 'Electronics', confidence: 95,
    })
    expect(res.body.greenCredits).toBeGreaterThan(0)
    expect(res.body.netCarbonSavedKg).toBeGreaterThan(0)
    expect(res.body.returnShippingCo2Kg).toBe(0.9)
  })
})
