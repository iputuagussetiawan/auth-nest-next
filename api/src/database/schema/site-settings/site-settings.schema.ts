import { pgTable, uuid, varchar, text, boolean, timestamp } from 'drizzle-orm/pg-core'

export const siteSettings = pgTable('site_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    // General
    siteName: varchar('site_name', { length: 200 }).notNull().default('My App'),
    tagline: varchar('tagline', { length: 300 }),
    description: text('description'),
    // Branding
    logoUrl: varchar('logo_url', { length: 500 }),
    faviconUrl: varchar('favicon_url', { length: 500 }),
    // Contact
    contactEmail: varchar('contact_email', { length: 200 }),
    contactPhone: varchar('contact_phone', { length: 50 }),
    contactAddress: text('contact_address'),
    // Social
    socialTwitter: varchar('social_twitter', { length: 500 }),
    socialFacebook: varchar('social_facebook', { length: 500 }),
    socialInstagram: varchar('social_instagram', { length: 500 }),
    socialLinkedin: varchar('social_linkedin', { length: 500 }),
    socialYoutube: varchar('social_youtube', { length: 500 }),
    // SEO
    metaTitle: varchar('meta_title', { length: 200 }),
    metaDescription: varchar('meta_description', { length: 500 }),
    metaKeywords: varchar('meta_keywords', { length: 300 }),
    ogImageUrl: varchar('og_image_url', { length: 500 }),
    googleAnalyticsId: varchar('google_analytics_id', { length: 50 }),
    // Maintenance
    maintenanceMode: boolean('maintenance_mode').notNull().default(false),
    maintenanceMessage: varchar('maintenance_message', { length: 500 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export type SiteSettings = typeof siteSettings.$inferSelect
export type NewSiteSettings = typeof siteSettings.$inferInsert
