import { describe, it, expect } from 'vitest'
import { parseJSON } from '../lib/parseJSON.js'

describe('parseJSON — defensive AI response parser', () => {
  it('parses clean JSON straight through', () => {
    const result = parseJSON('{"grade":"Good","confidence":82}')
    expect(result).toEqual({ grade: 'Good', confidence: 82 })
  })

  it('strips ```json fences that models often wrap responses in', () => {
    const fenced = '```json\n{"grade":"Like New","confidence":95}\n```'
    expect(parseJSON(fenced)).toEqual({ grade: 'Like New', confidence: 95 })
  })

  it('strips bare ``` fences without the json language tag', () => {
    const fenced = '```\n{"grade":"Acceptable","confidence":60}\n```'
    expect(parseJSON(fenced)).toEqual({ grade: 'Acceptable', confidence: 60 })
  })

  it('handles leading text before the JSON object (model preamble)', () => {
    const messy = 'Here is the grading result:\n{"grade":"Very Good","confidence":78}'
    expect(parseJSON(messy).grade).toBe('Very Good')
  })

  it('handles trailing text after the closing brace', () => {
    const messy = '{"grade":"Good","confidence":70}\nLet me know if you need more details.'
    expect(parseJSON(messy).grade).toBe('Good')
  })

  it('handles extra whitespace and newlines around the JSON', () => {
    const padded = '\n\n  {"grade":"Like New","confidence":99}  \n\n'
    expect(parseJSON(padded).confidence).toBe(99)
  })

  it('parses a full grading response with all keys', () => {
    const full = JSON.stringify({
      product: 'Wireless headphones',
      category: 'Electronics',
      grade: 'Very Good',
      confidence: 88,
      observations: ['Minor scuff on left cup'],
      conditionReport: 'Fully functional with light cosmetic wear.',
      co2SavedKgEstimate: 18,
    })
    const result = parseJSON(full)
    expect(result.product).toBe('Wireless headphones')
    expect(result.observations).toHaveLength(1)
    expect(result.co2SavedKgEstimate).toBe(18)
  })

  it('throws a descriptive error when there is no JSON object at all', () => {
    expect(() => parseJSON('Sorry, I cannot grade this image.')).toThrow('No JSON object found')
  })

  it('throws when the response is an empty string', () => {
    expect(() => parseJSON('')).toThrow('No JSON object found')
  })

  it('throws on malformed JSON (missing closing brace)', () => {
    expect(() => parseJSON('{"grade":"Good"')).toThrow()
  })
})
