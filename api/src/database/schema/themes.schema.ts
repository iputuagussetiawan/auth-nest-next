import { pgTable, uuid, varchar, boolean, timestamp, json } from 'drizzle-orm/pg-core'

export interface ThemeVars {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    chart1: string
    chart2: string
    chart3: string
    chart4: string
    chart5: string
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
}

export interface ThemeConfig {
    light: ThemeVars
    dark: ThemeVars
    radius: string
    fontFamily: string
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
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
