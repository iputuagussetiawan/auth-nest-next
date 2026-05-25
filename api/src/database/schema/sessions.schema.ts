import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    expiredAt: timestamp('expired_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
