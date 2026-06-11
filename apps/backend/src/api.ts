import { Router } from 'express'
import { createUrl } from './controllers/createUrlController.js'

export const router = Router()

router.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

router.post('/create-url', createUrl)
