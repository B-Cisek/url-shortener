import express from 'express'
import { env } from './config/env.js'
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth.js'
import cors from 'cors'

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

app.listen(env.appPort, () => {
  console.log(`Server is running on http://localhost:${env.appPort}`)
})
