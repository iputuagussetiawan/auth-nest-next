import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { themes } from '../../database/schema/themes.schema'
import { NotFoundException } from '../../common/exceptions/app-error'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'

const DEFAULT_LIGHT = {
    background: '#ffffff', foreground: '#0a0a0a',
    card: '#ffffff', cardForeground: '#0a0a0a',
    popover: '#ffffff', popoverForeground: '#0a0a0a',
    primary: '#171717', primaryForeground: '#fafafa',
    secondary: '#f5f5f5', secondaryForeground: '#171717',
    muted: '#f5f5f5', mutedForeground: '#737373',
    accent: '#f5f5f5', accentForeground: '#171717',
    destructive: '#ef4444',
    border: '#e5e5e5', input: '#e5e5e5', ring: '#a3a3a3',
    chart1: '#e76e50', chart2: '#2a9d8f', chart3: '#264653', chart4: '#e9c46a', chart5: '#f4a261',
    sidebar: '#fafafa', sidebarForeground: '#3f3f46',
    sidebarPrimary: '#18181b', sidebarPrimaryForeground: '#fafafa',
    sidebarAccent: '#f4f4f5', sidebarAccentForeground: '#18181b',
    sidebarBorder: '#e4e4e7', sidebarRing: '#3b82f6',
}

const DEFAULT_DARK = {
    background: '#0a0a0a', foreground: '#fafafa',
    card: '#171717', cardForeground: '#fafafa',
    popover: '#171717', popoverForeground: '#fafafa',
    primary: '#fafafa', primaryForeground: '#171717',
    secondary: '#262626', secondaryForeground: '#fafafa',
    muted: '#262626', mutedForeground: '#a3a3a3',
    accent: '#404040', accentForeground: '#fafafa',
    destructive: '#7f1d1d',
    border: '#262626', input: '#262626', ring: '#d4d4d4',
    chart1: '#e76e50', chart2: '#2a9d8f', chart3: '#264653', chart4: '#e9c46a', chart5: '#f4a261',
    sidebar: '#18181b', sidebarForeground: '#a1a1aa',
    sidebarPrimary: '#3b82f6', sidebarPrimaryForeground: '#ffffff',
    sidebarAccent: '#27272a', sidebarAccentForeground: '#fafafa',
    sidebarBorder: '#27272a', sidebarRing: '#3b82f6',
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

    async getAll() {
        return this.db.select().from(themes).orderBy(themes.createdAt)
    }

    async getActive() {
        const [active] = await this.db.select().from(themes).where(eq(themes.isActive, true)).limit(1)
        return active ?? { ...DEFAULT_THEME, id: 'default', createdAt: new Date(), updatedAt: new Date() }
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
        await this.db.delete(themes).where(eq(themes.id, id))
        return { message: 'Theme deleted' }
    }
}
