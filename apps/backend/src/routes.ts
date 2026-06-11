import { Router } from 'express'
import { createUrl, getUrl } from './modules/urls/controllers/url.controller.js'

export const router = Router()

router.get('/health', (_request, response) => {
  response.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  })
})

router.post('/create-url', createUrl)
router.get('/:code', getUrl)
