import type { Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { createUrlSchema } from '../dto/createUrl.dto.js'
import { create, findUserUrls, resolve } from '../services/url.service.js'
import z from 'zod'
import { auth } from '../../../lib/auth.js'
import { createClickEvent } from '../../analytics/clickEvent.js'
import { publishClick } from '../../analytics/clickPublisher.js'

export const createUrl = async (req: Request, res: Response) => {
  const result = createUrlSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(422).json({
      error: 'Validation Failed',
      issues: result.error.issues,
    })
  }

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  const response = await create(result.data, session?.user.id)

  res.status(201).json(response)
}

export const getUrl = async (req: Request, res: Response) => {
  const shortCodeSchema = z.string().regex(/^[a-zA-Z0-9]{6}$/)
  const result = shortCodeSchema.safeParse(req.params.code)

  if (!result.success) {
    return res.status(404).send('Not Found')
  }

  const url = await resolve(req.params.code as string)

  if (url === undefined) {
    return res.status(404).send('Not Found')
  }

  publishClick(createClickEvent(url.id, req))

  res.redirect(url.longUrl)
}

export const getUserUrls = async (req: Request, res: Response) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  })

  if (!session) {
    return res.status(401).json({
      error: 'Unauthorized',
    })
  }

  const urls = await findUserUrls(session.user.id)

  res.status(200).json(urls)
}
