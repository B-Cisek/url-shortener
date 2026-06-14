import { randomUUID } from 'node:crypto'
import { logger } from '../lib/logger.js'
import { redis } from '../lib/redis.js'
import { clickEventSchema } from '../modules/analytics/clickEventSchema.js'
import {
  deleteOldProcessedClickEvents,
  processClick,
} from '../modules/analytics/clickProcessor.js'
import {
  CLICK_CONSUMER_GROUP,
  CLICK_DEAD_LETTER_STREAM,
  CLICK_STREAM,
} from '../modules/analytics/types.js'

const BATCH_SIZE = 100
const BLOCK_MILLISECONDS = 5_000
const CLAIM_MIN_IDLE_MILLISECONDS = 60_000
const CLEANUP_INTERVAL_MILLISECONDS = 24 * 60 * 60 * 1000
const consumerName = `analytics-${randomUUID()}`
const workerRedis = redis.duplicate()

const ensureConsumerGroup = async (): Promise<void> => {
  try {
    await workerRedis.xGroupCreate(CLICK_STREAM, CLICK_CONSUMER_GROUP, '0', {
      MKSTREAM: true,
    })
  } catch (error) {
    if (!(error instanceof Error) || !error.message.includes('BUSYGROUP')) {
      throw error
    }
  }
}

const sendToDeadLetter = async (
  messageId: string,
  message: Record<string, string>,
  error: unknown,
): Promise<void> => {
  await workerRedis.xAdd(CLICK_DEAD_LETTER_STREAM, '*', {
    sourceMessageId: messageId,
    error: error instanceof Error ? error.message : 'Invalid click event',
    payload: JSON.stringify(message),
  })
}

const handleMessage = async (
  messageId: string,
  message: Record<string, string>,
): Promise<void> => {
  const result = clickEventSchema.safeParse(message)

  if (!result.success) {
    await sendToDeadLetter(messageId, message, result.error)
    await workerRedis.xAck(CLICK_STREAM, CLICK_CONSUMER_GROUP, messageId)
    return
  }

  await processClick(result.data)
  await workerRedis.xAck(CLICK_STREAM, CLICK_CONSUMER_GROUP, messageId)
}

const consume = async (): Promise<void> => {
  while (workerRedis.isOpen) {
    const claimed = await workerRedis.xAutoClaim(
      CLICK_STREAM,
      CLICK_CONSUMER_GROUP,
      consumerName,
      CLAIM_MIN_IDLE_MILLISECONDS,
      '0-0',
      { COUNT: BATCH_SIZE },
    )

    for (const message of claimed.messages) {
      if (message === null) {
        continue
      }

      try {
        await handleMessage(message.id, message.message)
      } catch (error) {
        logger.error(
          { err: error, messageId: message.id },
          'Failed to process claimed click event',
        )
      }
    }

    const streams = await workerRedis.xReadGroup(
      CLICK_CONSUMER_GROUP,
      consumerName,
      [{ key: CLICK_STREAM, id: '>' }],
      { COUNT: BATCH_SIZE, BLOCK: BLOCK_MILLISECONDS },
    )

    for (const stream of streams ?? []) {
      for (const message of stream.messages) {
        try {
          await handleMessage(message.id, message.message)
        } catch (error) {
          logger.error(
            { err: error, messageId: message.id },
            'Failed to process click event',
          )
        }
      }
    }
  }
}

const start = async (): Promise<void> => {
  await workerRedis.connect()
  await ensureConsumerGroup()
  await deleteOldProcessedClickEvents()

  const cleanupTimer = setInterval(() => {
    deleteOldProcessedClickEvents().catch((error: unknown) => {
      logger.error(error, 'Failed to clean processed click events')
    })
  }, CLEANUP_INTERVAL_MILLISECONDS)

  const shutdown = async (): Promise<void> => {
    clearInterval(cleanupTimer)

    if (workerRedis.isOpen) {
      await workerRedis.close()
    }
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  logger.info({ consumerName }, 'Analytics worker started')
  await consume()
}

start().catch((error: unknown) => {
  logger.error(error, 'Analytics worker failed')
  process.exit(1)
})
