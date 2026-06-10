import express from 'express'
import { env } from './config/env.js'

const app = express()

app.use(express.json())

app.get('/', (_request, response) => {
  response.json({ message: 'URL shortener API is running' })
})

app.listen(env.appPort, () => {
  console.log(`Server is running on http://localhost:${env.appPort}`)
})
