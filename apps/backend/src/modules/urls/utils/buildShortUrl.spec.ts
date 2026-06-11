import { describe, expect, it, vi } from 'vitest'

vi.mock('../../../config/env.js', () => ({
  env: {
    appUrl: 'https://sho.rt/',
  },
}))

import { buildShortUrl } from './buildShortUrl.js'

describe('buildShortUrl', () => {
  it('builds a URL without duplicate slashes', () => {
    expect(buildShortUrl('abc123')).toBe('https://sho.rt/abc123')
  })
})
