export interface ISiteSettings {
    id: string | null
    siteName: string
    tagline: string | null
    description: string | null
    logoUrl: string | null
    faviconUrl: string | null
    contactEmail: string | null
    contactPhone: string | null
    contactAddress: string | null
    socialTwitter: string | null
    socialFacebook: string | null
    socialInstagram: string | null
    socialLinkedin: string | null
    socialYoutube: string | null
    metaTitle: string | null
    metaDescription: string | null
    metaKeywords: string | null
    ogImageUrl: string | null
    googleAnalyticsId: string | null
    maintenanceMode: boolean
    maintenanceMessage: string | null
    createdAt: string
    updatedAt: string
}

export interface ISiteSettingsResponse {
    status: string
    message: string
    data: ISiteSettings
}
