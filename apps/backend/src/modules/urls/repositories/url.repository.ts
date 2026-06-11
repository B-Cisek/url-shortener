import { eq } from 'drizzle-orm'
import { urls } from '../../../db/schema.js'
import { db } from '../../../db/index.js'

type SaveUrl = Pick<
  typeof urls.$inferInsert,
  'longUrl' | 'shortCode' | 'userId' | 'expiresAt'
>

type Url = typeof urls.$inferSelect

export const save = async (
  url: SaveUrl,
): Promise<{ longUrl: string; shortCode: string }> => {
  const [result] = await db.insert(urls).values(url).returning({
    longUrl: urls.longUrl,
    shortCode: urls.shortCode,
  })

  return result
}

export const findByShortCode = async (
  shortCode: string,
): Promise<Url | undefined> => {
  const [url] = await db
    .select()
    .from(urls)
    .where(eq(urls.shortCode, shortCode))
    .limit(1)

  return url
}
