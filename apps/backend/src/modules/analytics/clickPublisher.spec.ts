import { beforeEach, describe, expect, it, vi } from 'vitest'
import { logger } from '../../lib/logger.js'
import { redis } from '../../lib/redis.js'
import { publishClick } from './clickPublisher.js'
import { CLICK_STREAM, type ClickEvent } from './types.js'

vi.mock('../../lib/redis.js', () => ({
  redis: {
    xAdd: vi.fn(),
  },
}))

vi.mock('../../lib/logger.js', () => ({
  logger: {
    warn: vi.fn(),
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

describe('publishClick', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishes the event to a capped Redis stream', () => {
    vi.mocked(redis.xAdd).mockResolvedValue('1-0')

    publishClick(event)

    expect(redis.xAdd).toHaveBeenCalledWith(CLICK_STREAM, '*', event, {
      TRIM: {
        strategy: 'MAXLEN',
        strategyModifier: '~',
        threshold: 100_000,
      },
    })
  })

  it('logs publication failures without throwing', async () => {
    vi.mocked(redis.xAdd).mockRejectedValue(new Error('Redis unavailable'))

    expect(() => publishClick(event)).not.toThrow()
    await vi.waitFor(() => expect(logger.warn).toHaveBeenCalledOnce())
  })
})
