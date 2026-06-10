import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import { fileURLToPath } from 'node:url'

dotenv.config({
  path: fileURLToPath(new URL('../../.env', import.meta.url)),
  quiet: true,
})

const databaseName = process.env.DATABASE_NAME || 'url'
const databaseUser = process.env.DATABASE_USER || 'user'
const databasePassword = process.env.DATABASE_PASSWORD || 'password'
const databaseUrl =
  process.env.DATABASE_URL ||
  `postgresql://${databaseUser}:${databasePassword}@localhost:5432/${databaseName}`

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
