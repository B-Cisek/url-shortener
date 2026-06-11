import type { Request, Response } from 'express'
import { z } from 'zod'

const createUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .pipe(z.httpUrl('Url nie jest poprawny')),
})

export const createUrl = async (req: Request, res: Response) => {
  const result = createUrlSchema.safeParse(req.body)

  if (!result.success) {
    return res.status(422).json({
      error: 'Validation Failed',
      issues: result.error.issues,
    })
  }

  // handler

  res.status(201).json()
}
