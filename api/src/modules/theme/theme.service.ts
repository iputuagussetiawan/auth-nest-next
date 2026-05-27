import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { themes } from '../../database/schema/themes.schema'
import { NotFoundException } from '../../common/exceptions/app-error'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'

const DEFAULT_THEME = {
    name: 'Default',
    slug: 'default',
    isActive: true,
    config: {
        primaryColor: '#6366f1',
        accentColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        foregroundColor: '#0f172a',
        cardColor: '#ffffff',
        borderRadius: '0.5',
        fontFamily: 'Inter',
        heroVariant: 'centered' as const,
        heroBackground: 'gradient' as const,
        darkMode: false,
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
