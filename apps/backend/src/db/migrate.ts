import { fileURLToPath } from 'node:url'
import { drizzle } from 'drizzle-orm/node-postgres'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { Pool } from 'pg'
import { env } from '../config/env.js'
import { logger } from '../lib/logger.js'

const runMigrations = async () => {
  const pool = new Pool({
    connectionString: env.databaseUrl,
  })

  try {
    await migrate(drizzle(pool), {
      migrationsFolder: fileURLToPath(new URL('../../drizzle', import.meta.url)),
    })
    logger.info('Database migrations completed')
  } finally {
    await pool.end()
  }
}

runMigrations().catch((error: unknown) => {
  logger.error(error, 'Database migrations failed')
  process.exit(1)
})
