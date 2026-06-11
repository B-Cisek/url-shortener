import { env } from '../../../config/env.js'

export const buildShortUrl = (shortCode: string): string => {
  const url = new URL(env.appUrl)

  url.pathname = `${url.pathname.replace(/\/+$/, '')}/${shortCode}`

  return url.toString()
}
