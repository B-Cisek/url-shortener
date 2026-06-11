import { describe, expect, it } from 'vitest'
import { toBase62 } from './base62Encoder.js'

describe('encode number to Base62', () => {
  it('encodes values using the expected alphabet', () => {
    expect(toBase62(1)).toBe('1')
    expect(toBase62(10)).toBe('a')
    expect(toBase62(35)).toBe('z')
    expect(toBase62(36)).toBe('A')
    expect(toBase62(61)).toBe('Z')
  })

  it('encodes values containing multiple digits', () => {
    expect(toBase62(62)).toBe('10')
    expect(toBase62(3843)).toBe('ZZ')
    expect(toBase62(3844)).toBe('100')
  })

  it('rejects non-positive values', () => {
    expect(() => toBase62(0)).toThrow(RangeError)
    expect(() => toBase62(-1)).toThrow(RangeError)
  })

  it('rejects values that are not integers', () => {
    expect(() => toBase62(1.5)).toThrow(TypeError)
    expect(() => toBase62(Number.NaN)).toThrow(TypeError)
  })
})
