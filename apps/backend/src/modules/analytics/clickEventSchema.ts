import { z } from 'zod'
import { DEVICE_TYPES } from './types.js'

export const clickEventSchema = z.object({
  eventId: z.uuid(),
  urlId: z.uuid(),
  occurredAt: z.iso.datetime(),
  countryCode: z.string().regex(/^(?:[A-Z]{2}|unknown)$/),
  deviceType: z.enum(DEVICE_TYPES),
  referrerDomain: z.string().min(1).max(253),
})
