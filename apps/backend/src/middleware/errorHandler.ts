import type { ErrorRequestHandler } from 'express'
import { AppError } from '../errors/appError.js'
import { logger } from '../lib/logger.js'

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request,
  response,
  next,
) => {
  if (response.headersSent) {
    next(error)
    return
  }

  if (error instanceof AppError) {
    logger.warn({ err: error }, 'Request failed')
    response.status(error.statusCode).json({
      error: error.message,
      ...(error.details === undefined ? {} : { details: error.details }),
    })
    return
  }

  logger.error({ err: error }, 'Unhandled request error')
  response.status(500).json({
    error: 'Internal Server Error',
  })
}
