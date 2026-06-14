import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import { env } from '../config/env.js'
import { redis } from '../lib/redis.js'

const createRedisStore = (prefix: string) =>
  new RedisStore({
    sendCommand: (...args: string[]) => redis.sendCommand(args),
    prefix: `rate-limit:${prefix}:`,
  })

export const createUrlRateLimiter = () =>
  rateLimit({
    windowMs: env.createUrlRateLimitWindowMs,
    limit: env.createUrlRateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    store: createRedisStore('create-url'),
    message: {
      error: 'Too many URLs created. Try again later.',
    },
  })
