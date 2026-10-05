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
    background: '#ffffff',
    foreground: '#171717',
    card: '#ffffff',
    cardForeground: '#171717',
    popover: '#ffffff',
    popoverForeground: '#171717',
    primary: '#171717',
    primaryForeground: '#ffffff',
    secondary: '#f2f2f2',
    secondaryForeground: '#171717',
    muted: '#f2f2f2',
    mutedForeground: '#666666',
    accent: '#0070f3',
    accentForeground: '#ffffff',
    destructive: '#da2f35',
    border: '#ebebeb',
    input: '#ebebeb',
    ring: '#0070f3',
    chart1: '#0070f3',
    chart2: '#7928ca',
    chart3: '#ff0080',
    chart4: '#f5a623',
    chart5: '#50e3c2',
    sidebar: '#fafafa',
    sidebarForeground: '#171717',
    sidebarPrimary: '#171717',
    sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#ebebeb',
    sidebarAccentForeground: '#171717',
    sidebarBorder: '#ebebeb',
    sidebarRing: '#0070f3',
}

const DEFAULT_DARK = {
    background: '#000000',
    foreground: '#ededed',
    card: '#0a0a0a',
    cardForeground: '#ededed',
    popover: '#0a0a0a',
    popoverForeground: '#ededed',
    primary: '#ededed',
    primaryForeground: '#0a0a0a',
    secondary: '#1a1a1a',
    secondaryForeground: '#ededed',
    muted: '#1a1a1a',
    mutedForeground: '#a1a1a1',
    accent: '#0070f3',
    accentForeground: '#ffffff',
    destructive: '#7f1d1d',
    border: '#2e2e2e',
    input: '#2e2e2e',
    ring: '#3291ff',
    chart1: '#3291ff',
    chart2: '#a463f2',
    chart3: '#ff4d9e',
    chart4: '#f7b955',
    chart5: '#50e3c2',
    sidebar: '#0a0a0a',
    sidebarForeground: '#a1a1a1',
    sidebarPrimary: '#ededed',
    sidebarPrimaryForeground: '#0a0a0a',
    sidebarAccent: '#1a1a1a',
    sidebarAccentForeground: '#ededed',
    sidebarBorder: '#2e2e2e',
    sidebarRing: '#3291ff',
}

const DEFAULT_THEME = {
    name: 'Monochrome',
    slug: 'monochrome',
    isActive: true,
    config: {
        light: DEFAULT_LIGHT,
        dark: DEFAULT_DARK,
        radius: '0.5',
        fontFamily: 'Inter',
        heroVariant: 'centered' as const,
        heroBackground: 'solid' as const,
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
