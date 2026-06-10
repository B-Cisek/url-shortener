import express from 'express'
import { env } from './config/env.js'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './lib/auth.js'
import cors from 'cors'
import { redis } from './lib/redis.js'

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

app.get('/', (_request, response) => {
  response.json({ message: 'URL shortener API is running' })
})

const start = async () => {
  await redis.connect()

  const server = app.listen(env.appPort, () => {
    console.log(`Server is running on http://localhost:${env.appPort}`)
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
  console.error('Failed to start server', error)
  process.exit(1)
})
