import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core'

import { users } from './users.schema'

export const VerificationTypeEnum = {
    EMAIL_VERIFICATION: 'email_verification',
    PASSWORD_RESET: 'password_reset',
} as const

export const verificationCodes = pgTable('verification_codes', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    code: varchar('code', { length: 100 }).notNull().unique(),
    type: varchar('type', { length: 50 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type VerificationCode = typeof verificationCodes.$inferSelect
