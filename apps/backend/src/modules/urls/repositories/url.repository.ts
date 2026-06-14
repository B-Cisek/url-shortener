import { desc, eq, sql } from 'drizzle-orm'
import { clickAnalyticsHourly, urls } from '../../../db/schema.js'
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

export const findByUserId = async (userId: string) =>
  db
    .select({
      id: urls.id,
      longUrl: urls.longUrl,
      shortCode: urls.shortCode,
      createdAt: urls.createdAt,
      expiresAt: urls.expiresAt,
      clickCount: sql<number>`coalesce(sum(${clickAnalyticsHourly.clickCount}), 0)::int`,
    })
    .from(urls)
    .leftJoin(clickAnalyticsHourly, eq(clickAnalyticsHourly.urlId, urls.id))
    .where(eq(urls.userId, userId))
    .groupBy(
      urls.id,
      urls.longUrl,
      urls.shortCode,
      urls.createdAt,
      urls.expiresAt,
    )
    .orderBy(desc(urls.createdAt))
