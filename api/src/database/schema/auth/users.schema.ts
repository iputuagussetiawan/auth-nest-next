import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    firstName: varchar('first_name', { length: 100 }),
    lastName: varchar('last_name', { length: 100 }),
    password: varchar('password', { length: 255 }),
    profilePicture: text('profile_picture'),
    isEmailVerified: boolean('is_email_verified').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    provider: varchar('provider', { length: 50 }).default('email'),
    providerId: varchar('provider_id', { length: 255 }),
    lastLogin: timestamp('last_login'),
    preferredThemeId: uuid('preferred_theme_id'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
