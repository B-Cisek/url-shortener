import { z } from 'zod'

export const createUrlSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1)
    .max(2048)
    .pipe(z.httpUrl('Url nie jest poprawny')),
})

export type CreateUrlDto = z.infer<typeof createUrlSchema>
