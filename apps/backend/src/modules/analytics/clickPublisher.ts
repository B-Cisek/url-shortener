import { logger } from '../../lib/logger.js'
import { redis } from '../../lib/redis.js'
import { CLICK_STREAM, type ClickEvent } from './types.js'

export const publishClick = (event: ClickEvent): void => {
  redis
    .xAdd(
      CLICK_STREAM,
      '*',
      { ...event },
      {
        TRIM: {
          strategy: 'MAXLEN',
          strategyModifier: '~',
          threshold: 100_000,
        },
      },
    )
    .catch((error: unknown) => {
      logger.warn({ err: error, urlId: event.urlId }, 'Failed to publish click')
    })
}
