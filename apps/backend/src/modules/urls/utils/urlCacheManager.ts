import { redis } from '../../../lib/redis.js'

const URL_CACHE_TTL_SECONDS = 60 * 60

const getCacheKey = (shortCode: string) => `url:${shortCode}`

export const urlCacheManager = {
  get(shortCode: string): Promise<string | null> {
    return redis.get(getCacheKey(shortCode))
  },

  async set(
    shortCode: string,
    longUrl: string,
    expiresAt: Date | null,
  ): Promise<void> {
    const expiresInSeconds = expiresAt
      ? Math.floor((expiresAt.getTime() - Date.now()) / 1000)
      : URL_CACHE_TTL_SECONDS

    if (expiresInSeconds <= 0) {
      return
    }

    await redis.set(getCacheKey(shortCode), longUrl, {
      EX: Math.min(expiresInSeconds, URL_CACHE_TTL_SECONDS),
    })
  },
}
