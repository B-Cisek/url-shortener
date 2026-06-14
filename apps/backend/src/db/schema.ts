import { relations, sql } from 'drizzle-orm'
import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  index,
  integer,
  varchar,
  pgSequence,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { COUNTER_KEY } from '../modules/urls/types.js'

export const shortCodeCounter = pgSequence(COUNTER_KEY, {
  startWith: 1,
  increment: 1,
  maxValue: 56_800_235_584,
  cycle: false,
})

export const user = pgTable('user', {
  id: uuid('id')
    .default(sql`pg_catalog.gen_random_uuid()`)
    .primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
})

export const session = pgTable(
  'session',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
)

export const account = pgTable(
  'account',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
)

export const verification = pgTable(
  'verification',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
)

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  urls: many(urls),
}))

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}))

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}))

export const urls = pgTable(
  'urls',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey(),
    longUrl: text().notNull(),
    shortCode: varchar({ length: 16 }).notNull().unique(),
    userId: uuid('user_id').references(() => user.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    expiresAt: timestamp({ withTimezone: true }),
  },
  (table) => [
    index('urls_user_id_index').on(table.userId),
    index('urls_expires_at_index').on(table.expiresAt),
  ],
)

export const urlsRelations = relations(urls, ({ one }) => ({
  user: one(user, {
    fields: [urls.userId],
    references: [user.id],
  }),
}))

export const clickAnalyticsHourly = pgTable(
  'click_analytics_hourly',
  {
    id: uuid()
      .default(sql`uuidv7()`)
      .primaryKey(),
    urlId: uuid('url_id')
      .notNull()
      .references(() => urls.id, { onDelete: 'cascade' }),
    hour: timestamp({ withTimezone: true }).notNull(),
    countryCode: varchar('country_code', { length: 7 }).notNull(),
    deviceType: varchar('device_type', { length: 16 }).notNull(),
    referrerDomain: varchar('referrer_domain', { length: 253 }).notNull(),
    clickCount: integer('click_count').default(0).notNull(),
  },
  (table) => [
    uniqueIndex('click_analytics_hourly_dimensions_unique').on(
      table.urlId,
      table.hour,
      table.countryCode,
      table.deviceType,
      table.referrerDomain,
    ),
    index('click_analytics_hourly_url_hour_index').on(table.urlId, table.hour),
  ],
)

export const processedClickEvents = pgTable(
  'processed_click_events',
  {
    eventId: uuid('event_id').primaryKey(),
    processedAt: timestamp('processed_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index('processed_click_events_processed_at_index').on(table.processedAt),
  ],
)

export const clickAnalyticsHourlyRelations = relations(
  clickAnalyticsHourly,
  ({ one }) => ({
    url: one(urls, {
      fields: [clickAnalyticsHourly.urlId],
      references: [urls.id],
    }),
  }),
)
