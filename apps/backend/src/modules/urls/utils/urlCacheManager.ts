import { redis } from '../../../lib/redis.js'

const URL_CACHE_TTL_SECONDS = 60 * 60

const getCacheKey = (shortCode: string) => `url:${shortCode}`

export interface ResolvedUrl {
  id: string
  longUrl: string
}

export const urlCacheManager = {
  async get(shortCode: string): Promise<ResolvedUrl | null> {
    const value = await redis.get(getCacheKey(shortCode))

    if (value === null) {
      return null
    }

    try {
      const parsed = JSON.parse(value) as Partial<ResolvedUrl>

      return typeof parsed.id === 'string' && typeof parsed.longUrl === 'string'
        ? { id: parsed.id, longUrl: parsed.longUrl }
        : null
    } catch {
      return null
    }
  },

  async set(
    shortCode: string,
    url: ResolvedUrl,
    expiresAt: Date | null,
  ): Promise<void> {
    const expiresInSeconds = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      : URL_CACHE_TTL_SECONDS

    if (expiresInSeconds <= 0) {
      return
    }

    await redis.set(getCacheKey(shortCode), JSON.stringify(url), {
      EX: Math.min(expiresInSeconds, URL_CACHE_TTL_SECONDS),
    })
  },
}
