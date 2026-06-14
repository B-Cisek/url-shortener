import type { Request, Response } from 'express'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createClickEvent } from '../../analytics/clickEvent.js'
import { publishClick } from '../../analytics/clickPublisher.js'
import { auth } from '../../../lib/auth.js'
import { findUserUrls, resolve } from '../services/url.service.js'
import { getUrl, getUserUrls } from './url.controller.js'

vi.mock('../../../lib/auth.js', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}))

vi.mock('../services/url.service.js', () => ({
  create: vi.fn(),
  findUserUrls: vi.fn(),
  resolve: vi.fn(),
}))

vi.mock('../../analytics/clickEvent.js', () => ({
  createClickEvent: vi.fn(),
}))

vi.mock('../../analytics/clickPublisher.js', () => ({
  publishClick: vi.fn(),
}))

describe('getUrl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('publishes one click event and redirects immediately', async () => {
    const request = { params: { code: 'abc123' } } as unknown as Request
    const response = {
      redirect: vi.fn(),
      send: vi.fn(),
      status: vi.fn(),
    } as unknown as Response
    const event = {
      eventId: '01976c18-0e28-7000-8000-000000000001',
      urlId: '01976c18-0e28-7000-8000-000000000000',
      occurredAt: '2026-06-14T21:42:13.123Z',
      countryCode: 'PL',
      deviceType: 'mobile' as const,
      referrerDomain: 'example.com',
    }

    vi.mocked(resolve).mockResolvedValue({
      id: event.urlId,
      longUrl: 'https://example.com',
    })
    vi.mocked(createClickEvent).mockReturnValue(event)

    await getUrl(request, response)

    expect(createClickEvent).toHaveBeenCalledWith(event.urlId, request)
    expect(publishClick).toHaveBeenCalledExactlyOnceWith(event)
    expect(response.redirect).toHaveBeenCalledExactlyOnceWith(
      'https://example.com',
    )
  })
})

describe('getUserUrls', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns only URLs belonging to the authenticated user', async () => {
    const request = { headers: {} } as Request
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response
    const urls = [
      {
        id: '01976c18-0e28-7000-8000-000000000000',
        longUrl: 'https://example.com',
        shortUrl: 'http://localhost:3000/abc123',
        clickCount: 42,
        createdAt: new Date('2026-06-15T10:00:00.000Z'),
        expiresAt: null,
      },
    ]

    vi.mocked(auth.api.getSession).mockResolvedValue({
      user: {
        id: 'user-id',
      },
    } as never)
    vi.mocked(findUserUrls).mockResolvedValue(urls)

    await getUserUrls(request, response)

    expect(findUserUrls).toHaveBeenCalledExactlyOnceWith('user-id')
    expect(response.status).toHaveBeenCalledWith(200)
    expect(response.json).toHaveBeenCalledWith(urls)
  })

  it('rejects unauthenticated requests', async () => {
    const request = { headers: {} } as Request
    const response = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    } as unknown as Response

    vi.mocked(auth.api.getSession).mockResolvedValue(null)

    await getUserUrls(request, response)

    expect(response.status).toHaveBeenCalledWith(401)
    expect(findUserUrls).not.toHaveBeenCalled()
  })
})
