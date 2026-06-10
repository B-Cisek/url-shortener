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
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const env = {
  appPort: Number(process.env.APP_PORT) || 3000,
  databaseUrl,
  frontendUrl,
  redisUrl,
}
