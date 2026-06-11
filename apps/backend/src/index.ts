import express from 'express'
import { env } from './config/env.js'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import cors from 'cors'
import { redis } from './lib/redis.js'
import { pinoHttp } from 'pino-http'
import { logger } from './lib/logger.js'
import { router } from './routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  }),
)
app.all('/api/auth/*splat', toNodeHandler(auth))
app.use(express.json())
app.use(pinoHttp({ logger }))
app.use('/', router)
app.use(errorHandler)

const start = async () => {
  await redis.connect()

  const server = app.listen(env.appPort, () => {
    logger.info({ port: env.appPort }, 'Server is running')
  })

  const shutdown = async () => {
    server.close(async () => {
      if (redis.isOpen) {
        await redis.close()
      }

      process.exit(0)
    })
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)
}

start().catch((error: unknown) => {
  logger.error(error, 'Failed to start server')
  process.exit(1)
})
