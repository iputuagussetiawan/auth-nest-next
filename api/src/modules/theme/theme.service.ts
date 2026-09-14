import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { themes } from '../../database/schema/theme/themes.schema'
import { users } from '../../database/schema/auth/users.schema'
import { NotFoundException } from '../../common/exceptions/app-error'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'

const DEFAULT_LIGHT = {
    background: '#fafafa', foreground: '#0a0a0a',
    card: '#ffffff', cardForeground: '#0a0a0a',
    popover: '#ffffff', popoverForeground: '#0a0a0a',
    primary: '#0564ff', primaryForeground: '#ffffff',
    secondary: '#eff6ff', secondaryForeground: '#1d4ed8',
    muted: '#f5f5f5', mutedForeground: '#737373',
    accent: '#dbeafe', accentForeground: '#1d4ed8',
    destructive: '#ef4444',
    border: '#e5e5e5', input: '#e5e5e5', ring: '#3b82f6',
    chart1: '#2563eb', chart2: '#0ea5e9', chart3: '#1d4ed8', chart4: '#38bdf8', chart5: '#60a5fa',
    sidebar: '#ffffff', sidebarForeground: '#3f3f46',
    sidebarPrimary: '#0564ff', sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#eff6ff', sidebarAccentForeground: '#1d4ed8',
    sidebarBorder: '#e4e4e7', sidebarRing: '#3b82f6',
}

const DEFAULT_DARK = {
    background: '#0a0a0a', foreground: '#fafafa',
    card: '#171717', cardForeground: '#fafafa',
    popover: '#171717', popoverForeground: '#fafafa',
    primary: '#0564ff', primaryForeground: '#ffffff',
    secondary: '#1e3a8a', secondaryForeground: '#dbeafe',
    muted: '#262626', mutedForeground: '#a3a3a3',
    accent: '#1d4ed8', accentForeground: '#eff6ff',
    destructive: '#7f1d1d',
    border: '#262626', input: '#262626', ring: '#60a5fa',
    chart1: '#60a5fa', chart2: '#38bdf8', chart3: '#2563eb', chart4: '#93c5fd', chart5: '#1d4ed8',
    sidebar: '#18181b', sidebarForeground: '#a1a1aa',
    sidebarPrimary: '#0564ff', sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#27272a', sidebarAccentForeground: '#fafafa',
    sidebarBorder: '#27272a', sidebarRing: '#60a5fa',
}

const DEFAULT_THEME = {
    name: 'Default',
    slug: 'default',
    isActive: true,
    config: {
        light: DEFAULT_LIGHT,
        dark: DEFAULT_DARK,
        radius: '0.625',
        fontFamily: 'Inter',
        heroVariant: 'centered' as const,
        heroBackground: 'gradient' as const,
    },
}

@Injectable()
export class ThemeService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    private async ensureDefaultTheme() {
        const existingThemes = await this.db.select().from(themes).orderBy(themes.createdAt)
        const defaultTheme = existingThemes.find((theme) => theme.slug === DEFAULT_THEME.slug)
        const activeCount = existingThemes.filter((theme) => theme.isActive).length
        const shouldActivateDefault = activeCount === 0

        if (!defaultTheme) {
            await this.db.update(themes).set({ isActive: false, updatedAt: new Date() })
            const [created] = await this.db.insert(themes).values({
                ...DEFAULT_THEME,
                isActive: true,
            }).returning()
            return created
        }

        const needsUpdate =
            defaultTheme.name !== DEFAULT_THEME.name ||
            JSON.stringify(defaultTheme.config) !== JSON.stringify(DEFAULT_THEME.config) ||
            (shouldActivateDefault && !defaultTheme.isActive)

        if (!needsUpdate) return defaultTheme

        if (shouldActivateDefault) {
            await this.db.update(themes).set({ isActive: false, updatedAt: new Date() })
        }

        const [updated] = await this.db
            .update(themes)
            .set({
                name: DEFAULT_THEME.name,
                config: DEFAULT_THEME.config,
                isActive: shouldActivateDefault ? true : defaultTheme.isActive,
                updatedAt: new Date(),
            })
            .where(eq(themes.id, defaultTheme.id))
            .returning()

        return updated
    }

    async getAll() {
        await this.ensureDefaultTheme()
        return this.db.select().from(themes).orderBy(themes.createdAt)
    }

    async getActive() {
        const defaultTheme = await this.ensureDefaultTheme()
        const [active] = await this.db.select().from(themes).where(eq(themes.isActive, true)).limit(1)
        return active ?? defaultTheme ?? { ...DEFAULT_THEME, id: 'default', createdAt: new Date(), updatedAt: new Date() }
    }

    async create(dto: CreateThemeDto) {
        if (dto.isActive) {
            await this.db.update(themes).set({ isActive: false })
        }
        const [created] = await this.db.insert(themes).values({
            name: dto.name,
            slug: dto.slug,
            isActive: dto.isActive ?? false,
            config: dto.config,
        }).returning()
        return created
    }

    async update(id: string, dto: UpdateThemeDto) {
        const [existing] = await this.db.select().from(themes).where(eq(themes.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Theme not found')

        if (dto.isActive) {
            await this.db.update(themes).set({ isActive: false })
        }

        const [updated] = await this.db
            .update(themes)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(themes.id, id))
            .returning()
        return updated
    }

    async activate(id: string) {
        const [existing] = await this.db.select().from(themes).where(eq(themes.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Theme not found')
        await this.db.update(themes).set({ isActive: false, updatedAt: new Date() })
        const [activated] = await this.db
            .update(themes)
            .set({ isActive: true, updatedAt: new Date() })
            .where(eq(themes.id, id))
            .returning()
        return activated
    }

    async delete(id: string) {
        const [existing] = await this.db.select().from(themes).where(eq(themes.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Theme not found')
        // Clear any user preferences pointing to this theme
        await this.db.update(users).set({ preferredThemeId: null, updatedAt: new Date() }).where(eq(users.preferredThemeId, id))
        await this.db.delete(themes).where(eq(themes.id, id))
        return { message: 'Theme deleted' }
    }

    async getAllPublic() {
        await this.ensureDefaultTheme()
        return this.db.select().from(themes).orderBy(themes.createdAt)
    }

    async getMyTheme(userId?: string | null) {
        if (userId) {
            const [user] = await this.db
                .select({ preferredThemeId: users.preferredThemeId })
                .from(users)
                .where(eq(users.id, userId))
                .limit(1)

            if (user?.preferredThemeId) {
                const [preferred] = await this.db
                    .select()
                    .from(themes)
                    .where(eq(themes.id, user.preferredThemeId))
                    .limit(1)
                if (preferred) return preferred
            }
        }
        return this.getActive()
    }

    async setPreference(userId: string, themeId: string) {
        const [theme] = await this.db.select().from(themes).where(eq(themes.id, themeId)).limit(1)
        if (!theme) throw new NotFoundException('Theme not found')
        await this.db
            .update(users)
            .set({ preferredThemeId: themeId, updatedAt: new Date() })
            .where(eq(users.id, userId))
        return { themeId }
    }
}
