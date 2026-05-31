import { pgTable, uuid, varchar, integer, boolean, timestamp } from 'drizzle-orm/pg-core'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

export const appModules = pgTable('app_modules', {
    id: uuid('id').defaultRandom().primaryKey(),
    parentId: uuid('parent_id').references((): AnyPgColumn => appModules.id, { onDelete: 'set null' }),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    path: varchar('path', { length: 255 }).notNull(),
    icon: varchar('icon', { length: 100 }),
    description: varchar('description', { length: 255 }),
    order: integer('order').notNull().default(0),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type AppModule = typeof appModules.$inferSelect
export type NewAppModule = typeof appModules.$inferInsert
