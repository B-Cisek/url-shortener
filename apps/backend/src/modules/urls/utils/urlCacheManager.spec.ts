import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redis } from '../../../lib/redis.js'
import { urlCacheManager } from './urlCacheManager.js'

vi.mock('../../../lib/redis.js', () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

const redisGet = vi.mocked(redis.get)
const redisSet = vi.mocked(redis.set)

describe('urlCacheManager', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('gets a URL using its namespaced cache key', async () => {
    redisGet.mockResolvedValue('https://example.com')

    await expect(urlCacheManager.get('abc123')).resolves.toBe(
      'https://example.com',
    )
    expect(redisGet).toHaveBeenCalledWith('url:abc123')
  })

  it('sets a URL with a one hour TTL by default', async () => {
    await urlCacheManager.set('abc123', 'https://example.com', null)

    expect(redisSet).toHaveBeenCalledWith('url:abc123', 'https://example.com', {
      EX: 3600,
    })
  })

  it('does not cache an expired URL', async () => {
    await urlCacheManager.set(
      'abc123',
      'https://example.com',
      new Date(Date.now() - 1_000),
    )

    expect(redisSet).not.toHaveBeenCalled()
  })
})
