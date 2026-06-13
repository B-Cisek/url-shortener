import { sql } from 'drizzle-orm'
import { db } from '../../../db/index.js'
import { COUNTER_KEY } from '../types.js'

export async function getNextCounter(): Promise<number> {
  const result = await db.execute<{ value: string }>(
    sql`SELECT nextval(${COUNTER_KEY}) AS value`,
  )

  const row = result.rows[0]

  if (!row) {
    throw new Error('PostgreSQL did not return the next counter value')
  }

  return Number(row.value)
}
