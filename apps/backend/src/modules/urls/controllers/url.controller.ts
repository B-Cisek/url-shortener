import type { Request, Response } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
import { createUrlSchema } from '../dto/createUrl.dto.js'
import { create, resolve } from '../services/url.service.js'
import z from 'zod'
import { auth } from '../../../lib/auth.js'

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

  const shortCode = await create(result.data, session?.user.id)

  res.status(201).json({ shortCode })
}

export const getUrl = async (req: Request, res: Response) => {
  const shortCodeSchema = z.string().regex(/^[a-zA-Z0-9]{6}$/)
  const result = shortCodeSchema.safeParse(req.params.code)

  if (!result.success) {
    return res.status(404).send('Not Found')
  }

  const longUrl = await resolve(req.params.code as string)

  if (longUrl === undefined) {
    return res.status(404).send('Not Found')
  }

  res.redirect(longUrl)
}
