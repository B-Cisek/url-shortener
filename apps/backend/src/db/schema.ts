import { sql } from 'drizzle-orm'
import {
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid()
    .default(sql`uuidv7()`)
    .primaryKey(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
})

export const urls = pgTable(
  'urls',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey(),
    longUrl: text().notNull(),
    shortCode: varchar({ length: 16 }).notNull().unique(),
    userId: uuid().references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index('urls_user_id_index').on(table.userId),
    index('urls_expires_at_index').on(table.expiresAt),
  ],
)
