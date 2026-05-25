import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'

import { DRIZZLE } from '../../../database/drizzle.provider'
import * as schema from '../../../database/schema'
import { permissions } from '../../../database/schema/permissions.schema'
import { BadRequestException, NotFoundException } from '../../../common/exceptions/app-error'
import type { CreatePermissionDto } from './dto/create-permission.dto'

@Injectable()
export class PermissionService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async findAll() {
        return this.db.select().from(permissions)
    }

    async findById(id: string) {
        const [perm] = await this.db.select().from(permissions).where(eq(permissions.id, id)).limit(1)
        if (!perm) throw new NotFoundException('Permission not found')
        return perm
    }

    async create(dto: CreatePermissionDto) {
        const [existing] = await this.db.select().from(permissions).where(eq(permissions.name, dto.name)).limit(1)
        if (existing) throw new BadRequestException('Permission already exists')

        const [perm] = await this.db
            .insert(permissions)
            .values({ name: dto.name, description: dto.description })
            .returning()
        return perm
    }

    async update(id: string, dto: Partial<CreatePermissionDto>) {
        await this.findById(id)
        const [updated] = await this.db
            .update(permissions)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(permissions.id, id))
            .returning()
        return updated
    }

    async remove(id: string) {
        await this.findById(id)
        await this.db.delete(permissions).where(eq(permissions.id, id))
        return { message: 'Permission deleted' }
    }
}
