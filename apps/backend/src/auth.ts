import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/index.js'
import { env } from './config/env.js'

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
  }),
  advanced: {
    database: {
      generateId: 'uuid',
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [env.frontendUrl],
})
