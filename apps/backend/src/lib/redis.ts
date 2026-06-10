import { createClient } from 'redis'
import { env } from '../config/env.js'
import { logger } from './logger.js'

export const redis = createClient({
  url: env.redisUrl,
})

redis.on('error', (error) => {
  logger.error(error, 'Redis client error')
})
