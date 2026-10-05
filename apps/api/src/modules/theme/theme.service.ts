import { Inject, Injectable } from '@nestjs/common'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { NotFoundException } from '../../common/exceptions/app-error'
import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { users } from '../../database/schema/auth/users.schema'
import { themes } from '../../database/schema/theme/themes.schema'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'

const DEFAULT_LIGHT = {
    background: '#f0fdf4',
    foreground: '#052e16',
    card: '#ffffff',
    cardForeground: '#052e16',
    popover: '#ffffff',
    popoverForeground: '#052e16',
    primary: '#065f46',
    primaryForeground: '#ffffff',
    secondary: '#ecfdf5',
    secondaryForeground: '#065f46',
    muted: '#d1fae5',
    mutedForeground: '#166534',
    accent: '#10b981',
    accentForeground: '#ffffff',
    destructive: '#dc2626',
    border: '#a7f3d0',
    input: '#a7f3d0',
    ring: '#10b981',
    chart1: '#065f46',
    chart2: '#10b981',
    chart3: '#34d399',
    chart4: '#059669',
    chart5: '#047857',
    sidebar: '#ecfdf5',
    sidebarForeground: '#052e16',
    sidebarPrimary: '#065f46',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#d1fae5',
    sidebarAccentForeground: '#065f46',
    sidebarBorder: '#a7f3d0',
    sidebarRing: '#10b981',
}

const DEFAULT_DARK = {
    background: '#020c06',
    foreground: '#d1fae5',
    card: '#052e16',
    cardForeground: '#d1fae5',
    popover: '#052e16',
    popoverForeground: '#d1fae5',
    primary: '#34d399',
    primaryForeground: '#020c06',
    secondary: '#064e3b',
    secondaryForeground: '#d1fae5',
    muted: '#064e3b',
    mutedForeground: '#6ee7b7',
    accent: '#10b981',
    accentForeground: '#020c06',
    destructive: '#7f1d1d',
    border: '#065f46',
    input: '#065f46',
    ring: '#34d399',
    chart1: '#34d399',
    chart2: '#6ee7b7',
    chart3: '#a7f3d0',
    chart4: '#10b981',
    chart5: '#d1fae5',
    sidebar: '#010802',
    sidebarForeground: '#6ee7b7',
    sidebarPrimary: '#34d399',
    sidebarPrimaryForeground: '#020c06',
    sidebarAccent: '#064e3b',
    sidebarAccentForeground: '#d1fae5',
    sidebarBorder: '#065f46',
    sidebarRing: '#34d399',
}

const DEFAULT_THEME = {
    name: 'Emerald Forest',
    slug: 'emerald-forest',
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
        const legacyTheme = existingThemes.find((theme) => theme.slug === 'default')
        let defaultTheme = existingThemes.find((theme) => theme.slug === DEFAULT_THEME.slug)

        // Migrate the old default row instead of creating a second active theme.
        if (!defaultTheme && legacyTheme) {
            const [migrated] = await this.db
                .update(themes)
                .set({
                    ...DEFAULT_THEME,
                    isActive: legacyTheme.isActive,
                    updatedAt: new Date(),
                })
                .where(eq(themes.id, legacyTheme.id))
                .returning()
            defaultTheme = migrated
        } else if (defaultTheme && legacyTheme && defaultTheme.id !== legacyTheme.id) {
            // Point users at the canonical row before removing the legacy duplicate.
            await this.db
                .update(users)
                .set({ preferredThemeId: defaultTheme.id, updatedAt: new Date() })
                .where(eq(users.preferredThemeId, legacyTheme.id))
            await this.db.delete(themes).where(eq(themes.id, legacyTheme.id))
        }

        if (!defaultTheme) {
            await this.db.update(themes).set({ isActive: false, updatedAt: new Date() })
            const [created] = await this.db
                .insert(themes)
                .values({
                    ...DEFAULT_THEME,
                    isActive: true,
                })
                .returning()
            return created
        }

        const activeCount = existingThemes.filter(
            (theme) => theme.isActive && theme.id !== legacyTheme?.id,
        ).length
        const shouldActivateDefault = activeCount === 0
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
                slug: DEFAULT_THEME.slug,
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
        const [active] = await this.db
            .select()
            .from(themes)
            .where(eq(themes.isActive, true))
            .limit(1)
        return (
            active ??
            defaultTheme ?? {
                ...DEFAULT_THEME,
                id: 'default',
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        )
    }

    async create(dto: CreateThemeDto) {
        if (dto.isActive) {
            await this.db.update(themes).set({ isActive: false })
        }
        const [created] = await this.db
            .insert(themes)
            .values({
                name: dto.name,
                slug: dto.slug,
                isActive: dto.isActive ?? false,
                config: dto.config,
            })
            .returning()
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
        await this.db
            .update(users)
            .set({ preferredThemeId: null, updatedAt: new Date() })
            .where(eq(users.preferredThemeId, id))
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
