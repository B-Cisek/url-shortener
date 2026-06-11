import { describe, expect, it } from 'vitest'
import { toShortCode } from './shortCodeGenerator.js'

describe('generate shorcode for url', () => {
  it('pads encoded values to six characters', () => {
    expect(toShortCode(1)).toBe('000001')
    expect(toShortCode(62)).toBe('000010')
  })

  it('allows the largest six-character code', () => {
    expect(toShortCode(62 ** 6 - 1)).toBe('ZZZZZZ')
  })

  it('rejects values requiring more than six characters', () => {
    expect(() => toShortCode(62 ** 6)).toThrow(
      new RangeError('Code exceeds 6-character limit'),
    )
  })
})
