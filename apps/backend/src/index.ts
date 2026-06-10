import express from 'express'

const app = express()
const port = Number(process.env.PORT) || 3000

app.use(express.json())

app.get('/', (_request, response) => {
  response.json({ message: 'URL shortener API is running' })
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
