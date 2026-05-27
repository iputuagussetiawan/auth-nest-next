import { pgTable, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core'

export const roles = pgTable('roles', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).notNull().unique(),
    description: text('description'),
    icon: varchar('icon', { length: 100 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Role = typeof roles.$inferSelect
export type NewRole = typeof roles.$inferInsert
