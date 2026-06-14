import type { Request } from 'express'
import { describe, expect, it } from 'vitest'
import { createClickEvent } from './clickEvent.js'

const createRequest = (headers: Record<string, string>): Request =>
  ({
    get(name: string) {
      return headers[name.toLowerCase()]
    },
  }) as Request

describe('createClickEvent', () => {
  it('extracts the supported analytics dimensions', () => {
    const request = createRequest({
      'cf-ipcountry': 'pl',
      'user-agent': 'Mozilla/5.0 (iPhone; Mobile)',
      referer: 'https://Example.com/page?campaign=summer',
    })

    const event = createClickEvent(
      '01976c18-0e28-7000-8000-000000000000',
      request,
    )

    expect(event).toMatchObject({
      urlId: '01976c18-0e28-7000-8000-000000000000',
      countryCode: 'PL',
      deviceType: 'mobile',
      referrerDomain: 'example.com',
    })
    expect(event.eventId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    )
    expect(new Date(event.occurredAt).toISOString()).toBe(event.occurredAt)
  })

  it('uses safe defaults for missing and invalid headers', () => {
    const request = createRequest({
      'cf-ipcountry': 'invalid',
      referer: 'not a url',
    })

    expect(
      createClickEvent('01976c18-0e28-7000-8000-000000000000', request),
    ).toMatchObject({
      countryCode: 'unknown',
      deviceType: 'unknown',
      referrerDomain: 'direct',
    })
  })
})
