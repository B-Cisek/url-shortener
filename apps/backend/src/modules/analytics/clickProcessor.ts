import { lt, sql } from 'drizzle-orm'
import { db } from '../../db/index.js'
import { clickAnalyticsHourly, processedClickEvents } from '../../db/schema.js'
import type { ClickEvent } from './types.js'

export const processClick = async (event: ClickEvent): Promise<boolean> =>
  db.transaction(async (tx) => {
    const inserted = await tx
      .insert(processedClickEvents)
      .values({ eventId: event.eventId })
      .onConflictDoNothing()
      .returning({ eventId: processedClickEvents.eventId })

    if (inserted.length === 0) {
      return false
    }

    const hour = new Date(event.occurredAt)
    hour.setUTCMinutes(0, 0, 0)

    await tx
      .insert(clickAnalyticsHourly)
      .values({
        urlId: event.urlId,
        hour,
        countryCode: event.countryCode,
        deviceType: event.deviceType,
        referrerDomain: event.referrerDomain,
        clickCount: 1,
      })
      .onConflictDoUpdate({
        target: [
          clickAnalyticsHourly.urlId,
          clickAnalyticsHourly.hour,
          clickAnalyticsHourly.countryCode,
          clickAnalyticsHourly.deviceType,
          clickAnalyticsHourly.referrerDomain,
        ],
        set: {
          clickCount: sql`${clickAnalyticsHourly.clickCount} + 1`,
        },
      })

    return true
  })

export const deleteOldProcessedClickEvents = async (): Promise<void> => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  await db
    .delete(processedClickEvents)
    .where(lt(processedClickEvents.processedAt, cutoff))
}
