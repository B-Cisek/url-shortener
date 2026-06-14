import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../db/index.js'
import { clickAnalyticsHourly, processedClickEvents } from '../../db/schema.js'
import { processClick } from './clickProcessor.js'
import type { ClickEvent } from './types.js'

vi.mock('../../db/index.js', () => ({
  db: {
    transaction: vi.fn(),
  },
}))

const event: ClickEvent = {
  eventId: '01976c18-0e28-7000-8000-000000000001',
  urlId: '01976c18-0e28-7000-8000-000000000000',
  occurredAt: '2026-06-14T21:42:13.123Z',
  countryCode: 'PL',
  deviceType: 'mobile',
  referrerDomain: 'example.com',
}

describe('processClick', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('aggregates a new event into its UTC hour', async () => {
    const aggregateOnConflictDoUpdate = vi.fn().mockResolvedValue(undefined)
    const aggregateValues = vi.fn().mockReturnValue({
      onConflictDoUpdate: aggregateOnConflictDoUpdate,
    })
    const processedReturning = vi
      .fn()
      .mockResolvedValue([{ eventId: event.eventId }])
    const processedValues = vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockReturnValue({
        returning: processedReturning,
      }),
    })
    const tx = {
      insert: vi.fn((table) => {
        if (table === processedClickEvents) {
          return { values: processedValues }
        }

        if (table === clickAnalyticsHourly) {
          return { values: aggregateValues }
        }

        throw new Error('Unexpected table')
      }),
    }

    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback(tx as never),
    )

    await expect(processClick(event)).resolves.toBe(true)
    expect(aggregateValues).toHaveBeenCalledWith({
      urlId: event.urlId,
      hour: new Date('2026-06-14T21:00:00.000Z'),
      countryCode: 'PL',
      deviceType: 'mobile',
      referrerDomain: 'example.com',
      clickCount: 1,
    })
    expect(aggregateOnConflictDoUpdate).toHaveBeenCalledOnce()
  })

  it('does not aggregate an event that was already processed', async () => {
    const tx = {
      insert: vi.fn(() => ({
        values: vi.fn().mockReturnValue({
          onConflictDoNothing: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]),
          }),
        }),
      })),
    }

    vi.mocked(db.transaction).mockImplementation(async (callback) =>
      callback(tx as never),
    )

    await expect(processClick(event)).resolves.toBe(false)
    expect(tx.insert).toHaveBeenCalledOnce()
  })
})
