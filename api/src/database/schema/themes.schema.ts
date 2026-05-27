import { pgTable, uuid, varchar, boolean, timestamp, json } from 'drizzle-orm/pg-core'

export interface ThemeConfig {
    primaryColor: string      // hex e.g. "#6366f1"
    accentColor: string       // hex
    backgroundColor: string   // hex
    foregroundColor: string   // hex
    cardColor: string         // hex
    borderRadius: string      // number string e.g. "0.5"
    fontFamily: string        // e.g. "Inter"
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
    darkMode: boolean
}

export const themes = pgTable('themes', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).notNull().unique(),
    isActive: boolean('is_active').notNull().default(false),
    config: json('config').$type<ThemeConfig>().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type Theme = typeof themes.$inferSelect
export type NewTheme = typeof themes.$inferInsert
