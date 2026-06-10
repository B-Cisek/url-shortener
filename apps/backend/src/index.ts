import express from 'express'
import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

dotenv.config({
  path: fileURLToPath(new URL('../../../.env', import.meta.url)),
})

const app = express()
const port = Number(process.env.APP_PORT) || 3000

app.use(express.json())

app.get('/', (_request, response) => {
  response.json({ message: 'URL shortener API is running' })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
