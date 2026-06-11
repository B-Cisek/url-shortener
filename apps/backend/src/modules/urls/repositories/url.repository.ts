import { db } from '@/db/index.js'
import { urls } from '@/db/schema.js'
import { eq } from 'drizzle-orm'

type SaveUrl = Pick<
  typeof urls.$inferInsert,
  'longUrl' | 'shortCode' | 'userId' | 'expiresAt'
>

type Url = typeof urls.$inferSelect

export const save = async (url: SaveUrl): Promise<void> => {
  await db.insert(urls).values(url)
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
