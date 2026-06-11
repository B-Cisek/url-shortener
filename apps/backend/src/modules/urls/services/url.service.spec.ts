import { beforeEach, describe, expect, it, vi } from 'vitest'
import { redis } from '../../../lib/redis.js'
import { findByShortCode, save } from '../repositories/url.repository.js'
import { urlCacheManager } from '../utils/urlCacheManager.js'
import { create, resolve } from './url.service.js'

vi.mock('../../../lib/redis.js', () => ({
  redis: {
    incr: vi.fn(),
  },
}))

vi.mock('../repositories/url.repository.js', () => ({
  findByShortCode: vi.fn(),
  save: vi.fn(),
}))

vi.mock('../utils/urlCacheManager.js', () => ({
  urlCacheManager: {
    get: vi.fn(),
    set: vi.fn(),
  },
}))

const redisIncr = vi.mocked(redis.incr)
const repositoryFindByShortCode = vi.mocked(findByShortCode)
const repositorySave = vi.mocked(save)
const cacheGet = vi.mocked(urlCacheManager.get)
const cacheSet = vi.mocked(urlCacheManager.set)

describe('create', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not cache a URL before it is used', async () => {
    redisIncr.mockResolvedValue(1)

    await create({ url: 'https://example.com' })

    expect(repositorySave).toHaveBeenCalledOnce()
    expect(cacheSet).not.toHaveBeenCalled()
  })
})

describe('resolve', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the URL from Redis on a cache hit', async () => {
    cacheGet.mockResolvedValue('https://example.com')

    await expect(resolve('abc123')).resolves.toBe('https://example.com')
    expect(repositoryFindByShortCode).not.toHaveBeenCalled()
  })

  it('caches and returns the URL from the database on a cache miss', async () => {
    cacheGet.mockResolvedValue(null)
    repositoryFindByShortCode.mockResolvedValue({
      id: '01976c18-0e28-7000-8000-000000000000',
      longUrl: 'https://example.com',
      shortCode: 'abc123',
      userId: null,
      createdAt: new Date(),
      expiresAt: null,
    })

    await expect(resolve('abc123')).resolves.toBe('https://example.com')
    expect(cacheSet).toHaveBeenCalledWith('abc123', 'https://example.com', null)
  })

  it('does not return or cache an expired URL', async () => {
    cacheGet.mockResolvedValue(null)
    repositoryFindByShortCode.mockResolvedValue({
      id: '01976c18-0e28-7000-8000-000000000000',
      longUrl: 'https://example.com',
      shortCode: 'abc123',
      userId: null,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() - 1_000),
    })

    await expect(resolve('abc123')).resolves.toBeUndefined()
    expect(cacheSet).not.toHaveBeenCalled()
  })
})
