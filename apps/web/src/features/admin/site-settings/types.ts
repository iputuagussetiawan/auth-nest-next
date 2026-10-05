import { z } from 'zod'

export const schema = z.object({
    siteName: z.string().min(1).max(200),
    tagline: z.string().max(300).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    logoUrl: z.string().max(500).optional().or(z.literal('')),
    faviconUrl: z.string().max(500).optional().or(z.literal('')),
    contactEmail: z.email().optional().or(z.literal('')),
    contactPhone: z.string().max(50).optional().or(z.literal('')),
    contactAddress: z.string().optional().or(z.literal('')),
    socialTwitter: z.string().max(500).optional().or(z.literal('')),
    socialFacebook: z.string().max(500).optional().or(z.literal('')),
    socialInstagram: z.string().max(500).optional().or(z.literal('')),
    socialLinkedin: z.string().max(500).optional().or(z.literal('')),
    socialYoutube: z.string().max(500).optional().or(z.literal('')),
    metaTitle: z.string().max(200).optional().or(z.literal('')),
    metaDescription: z.string().max(500).optional().or(z.literal('')),
    metaKeywords: z.string().max(300).optional().or(z.literal('')),
    ogImageUrl: z.string().max(500).optional().or(z.literal('')),
    googleAnalyticsId: z.string().max(50).optional().or(z.literal('')),
    maintenanceMode: z.boolean(),
    maintenanceMessage: z.string().max(500).optional().or(z.literal('')),
})

export type FormValues = z.infer<typeof schema>

export const EMPTY: FormValues = {
    siteName: 'My App',
    tagline: '',
    description: '',
    logoUrl: '',
    faviconUrl: '',
    contactEmail: '',
    contactPhone: '',
    contactAddress: '',
    socialTwitter: '',
    socialFacebook: '',
    socialInstagram: '',
    socialLinkedin: '',
    socialYoutube: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    ogImageUrl: '',
    googleAnalyticsId: '',
    maintenanceMode: false,
    maintenanceMessage: '',
}
