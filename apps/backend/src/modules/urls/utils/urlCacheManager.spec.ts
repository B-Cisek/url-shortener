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
    redisGet.mockResolvedValue(
      JSON.stringify({
        id: '01976c18-0e28-7000-8000-000000000000',
        longUrl: 'https://example.com',
      }),
    )

    await expect(urlCacheManager.get('abc123')).resolves.toEqual({
      id: '01976c18-0e28-7000-8000-000000000000',
      longUrl: 'https://example.com',
    })
    expect(redisGet).toHaveBeenCalledWith('url:abc123')
  })

  it('treats a legacy cache value as a miss', async () => {
    redisGet.mockResolvedValue('https://example.com')

    await expect(urlCacheManager.get('abc123')).resolves.toBeNull()
  })

  it('sets a URL with a one hour TTL by default', async () => {
    await urlCacheManager.set(
      'abc123',
      {
        id: '01976c18-0e28-7000-8000-000000000000',
        longUrl: 'https://example.com',
      },
      null,
    )

    expect(redisSet).toHaveBeenCalledWith(
      'url:abc123',
      JSON.stringify({
        id: '01976c18-0e28-7000-8000-000000000000',
        longUrl: 'https://example.com',
      }),
      {
        EX: 3600,
      },
    )
  })

  it('does not cache an expired URL', async () => {
    await urlCacheManager.set(
      'abc123',
      {
        id: '01976c18-0e28-7000-8000-000000000000',
        longUrl: 'https://example.com',
      },
      new Date(Date.now() - 1_000),
    )

    expect(redisSet).not.toHaveBeenCalled()
  })
})
