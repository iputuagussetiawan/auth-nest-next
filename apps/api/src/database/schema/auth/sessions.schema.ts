import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const sessions = pgTable('sessions', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    // Random per-browser id from the deviceId cookie; a new login from the same browser replaces its old session
    deviceId: uuid('device_id'),
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
    expiredAt: timestamp('expired_at').notNull(),
    // Refresh token rotation: only the current token id may refresh; replaying an older one revokes the session
    refreshTokenId: uuid('refresh_token_id'),
    previousRefreshTokenId: uuid('previous_refresh_token_id'),
    refreshRotatedAt: timestamp('refresh_rotated_at'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
