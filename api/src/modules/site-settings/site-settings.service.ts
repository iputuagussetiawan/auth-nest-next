import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { siteSettings } from '../../database/schema/site-settings.schema'
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto'

const DEFAULTS = {
    siteName: 'My App',
    tagline: null,
    description: null,
    logoUrl: null,
    faviconUrl: null,
    contactEmail: null,
    contactPhone: null,
    contactAddress: null,
    socialTwitter: null,
    socialFacebook: null,
    socialInstagram: null,
    socialLinkedin: null,
    socialYoutube: null,
    metaTitle: null,
    metaDescription: null,
    metaKeywords: null,
    ogImageUrl: null,
    googleAnalyticsId: null,
    maintenanceMode: false,
    maintenanceMessage: null,
}

@Injectable()
export class SiteSettingsService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async get() {
        const [row] = await this.db.select().from(siteSettings).limit(1)
        return row ?? { id: null, ...DEFAULTS, createdAt: new Date(), updatedAt: new Date() }
    }

    async update(dto: UpdateSiteSettingsDto) {
        const [existing] = await this.db.select().from(siteSettings).limit(1)

        if (existing) {
            const [updated] = await this.db
                .update(siteSettings)
                .set({ ...dto, updatedAt: new Date() })
                .returning()
            return updated
        }

        const [created] = await this.db
            .insert(siteSettings)
            .values({ ...DEFAULTS, ...dto })
            .returning()
        return created
    }
}
