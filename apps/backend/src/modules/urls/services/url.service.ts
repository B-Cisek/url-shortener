import { CreateUrlDto } from '../dto/createUrl.dto.js'
import { toShortCode } from '../utils/shortCodeGenerator.js'
import { findByShortCode, save } from '../repositories/url.repository.js'
import { urlCacheManager } from '../utils/urlCacheManager.js'
import { buildShortUrl } from '../utils/buildShortUrl.js'
import { getNextCounter } from '../repositories/shortCodeCounter.repository.js'

export async function create(
  dto: CreateUrlDto,
  userId?: string,
): Promise<{ longUrl: string; shortUrl: string }> {
  const counter = await getNextCounter()

  const shortCode = toShortCode(counter)

  const url = await save({
    longUrl: dto.url,
    shortCode,
    userId,
  })

  return {
    longUrl: url.longUrl,
    shortUrl: buildShortUrl(url.shortCode),
  }
}

export async function resolve(code: string): Promise<string | undefined> {
  const cachedUrl = await urlCacheManager.get(code)

  if (cachedUrl !== null) {
    return cachedUrl
  }

  const url = await findByShortCode(code)

  if (url === undefined) {
    return undefined
  }

  if (url.expiresAt && url.expiresAt.getTime() <= Date.now()) {
    return undefined
  }

  await urlCacheManager.set(code, url.longUrl, url.expiresAt)

  return url.longUrl
}
