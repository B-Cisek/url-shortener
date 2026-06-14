import { randomUUID } from 'node:crypto'
import type { Request } from 'express'
import type { ClickEvent, DeviceType } from './types.js'

const COUNTRY_CODE_PATTERN = /^[A-Z]{2}$/

const getCountryCode = (request: Request): string => {
  const value = request.get('CF-IPCountry')?.toUpperCase()

  return value && COUNTRY_CODE_PATTERN.test(value) ? value : 'unknown'
}

const getDeviceType = (request: Request): DeviceType => {
  const userAgent = request.get('user-agent')?.toLowerCase() ?? ''

  if (
    /ipad|tablet|kindle|silk/.test(userAgent) ||
    (/android/.test(userAgent) && !/mobile/.test(userAgent))
  ) {
    return 'tablet'
  }

  if (/mobile|iphone|ipod|android/.test(userAgent)) {
    return 'mobile'
  }

  return userAgent.length > 0 ? 'desktop' : 'unknown'
}

const getReferrerDomain = (request: Request): string => {
  const referrer = request.get('referer')

  if (!referrer) {
    return 'direct'
  }

  try {
    return new URL(referrer).hostname.toLowerCase() || 'direct'
  } catch {
    return 'direct'
  }
}

export const createClickEvent = (
  urlId: string,
  request: Request,
): ClickEvent => ({
  eventId: randomUUID(),
  urlId,
  occurredAt: new Date().toISOString(),
  countryCode: getCountryCode(request),
  deviceType: getDeviceType(request),
  referrerDomain: getReferrerDomain(request),
})
