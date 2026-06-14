import dotenv from 'dotenv'
import { fileURLToPath } from 'node:url'

dotenv.config({
  path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
  quiet: true,
})

const databaseName = process.env.DATABASE_NAME || 'url'
const databaseUser = process.env.DATABASE_USER || 'user'
const databasePassword = process.env.DATABASE_PASSWORD || 'password'
const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${databaseUser}:${databasePassword}@localhost:5432/${databaseName}`
const appPort = Number(process.env.APP_PORT) || 3000
const appUrl = process.env.APP_URL || `http://localhost:${appPort}`
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
const createUrlRateLimitWindowMs =
  Number(process.env.CREATE_URL_RATE_LIMIT_WINDOW_MS) || 60 * 1000
const createUrlRateLimitMax = Number(process.env.CREATE_URL_RATE_LIMIT_MAX) || 10

export const env = {
  appPort,
  appUrl,
  createUrlRateLimitMax,
  createUrlRateLimitWindowMs,
  databaseUrl,
  frontendUrl,
  redisUrl,
}
