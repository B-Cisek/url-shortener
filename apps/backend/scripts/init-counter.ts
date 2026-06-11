import { createClient } from 'redis'
import console from 'console'
import { env } from '@/config/env.js'
import { COUNTER_KEY } from '@/types.js'

const redis = createClient({
  url: env.redisUrl,
})

await redis.connect()

await redis.set(COUNTER_KEY, 1, {
  NX: true,
})

console.log('Counter initialized.')

await redis.quit()
