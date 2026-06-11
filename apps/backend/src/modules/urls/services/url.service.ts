import { CreateUrlDto } from '../dto/createUrl.dto.js'
import { toShortCode } from '../utils/shortCodeGenerator.js'
import { save } from '../repositories/url.repository.js'
import { redis } from '../../../lib/redis.js'
import { COUNTER_KEY } from '../types.js'

export async function create(
  dto: CreateUrlDto,
  userId?: string,
): Promise<string> {
  const counter = await redis.incr(COUNTER_KEY)

  const shortCode = toShortCode(counter)

  await save({
    longUrl: dto.url,
    shortCode,
    userId,
  })

  return shortCode
}
