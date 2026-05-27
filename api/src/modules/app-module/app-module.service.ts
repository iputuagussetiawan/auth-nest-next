import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, inArray } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { appModules } from '../../database/schema/app-modules.schema'
import { roleModules } from '../../database/schema/role-modules.schema'
import { NotFoundException } from '../../common/exceptions/app-error'
import { CreateAppModuleDto } from './dto/create-app-module.dto'
import { UpdateAppModuleDto } from './dto/update-app-module.dto'

@Injectable()
export class AppModuleService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async getAll() {
        const rows = await this.db.select().from(appModules).orderBy(appModules.order)
        const allRoleModules = await this.db.select().from(roleModules)
        return rows.map((m) => ({
            ...m,
            roleIds: allRoleModules.filter((rm) => rm.moduleId === m.id).map((rm) => rm.roleId),
        }))
    }

    async create(dto: CreateAppModuleDto) {
        const { roleIds, ...rest } = dto
        const [created] = await this.db
            .insert(appModules)
            .values({ ...rest, isActive: rest.isActive ?? true })
            .returning()

        if (roleIds?.length) {
            await this.db.insert(roleModules).values(
                roleIds.map((roleId) => ({ roleId, moduleId: created.id })),
            )
        }

        this.writePageFile(created.slug, created.name)

        return { ...created, roleIds: roleIds ?? [] }
    }

    async update(id: string, dto: UpdateAppModuleDto) {
        const [existing] = await this.db.select().from(appModules).where(eq(appModules.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Module not found')

        const { roleIds, ...rest } = dto
        const [updated] = await this.db
            .update(appModules)
            .set({ ...rest, updatedAt: new Date() })
            .where(eq(appModules.id, id))
            .returning()

        if (roleIds !== undefined) {
            await this.db.delete(roleModules).where(eq(roleModules.moduleId, id))
            if (roleIds.length) {
                await this.db.insert(roleModules).values(
                    roleIds.map((roleId) => ({ roleId, moduleId: id })),
                )
            }
        }

        const finalRoleIds = roleIds ?? (await this.db.select({ roleId: roleModules.roleId }).from(roleModules).where(eq(roleModules.moduleId, id))).map((r) => r.roleId)
        return { ...updated, roleIds: finalRoleIds }
    }

    async delete(id: string) {
        const [existing] = await this.db.select().from(appModules).where(eq(appModules.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Module not found')
        await this.db.delete(appModules).where(eq(appModules.id, id))
        this.deletePageFile(existing.slug)
        return { message: 'Module deleted' }
    }

    async reorder(ids: string[]) {
        await Promise.all(
            ids.map((id, index) =>
                this.db.update(appModules).set({ order: index, updatedAt: new Date() }).where(eq(appModules.id, id)),
            ),
        )
        return { message: 'Modules reordered' }
    }

    private writePageFile(slug: string, name: string) {
        try {
            const pascal = slug
                .split('-')
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join('')

            const dir = path.resolve(process.cwd(), '../web/src/app/(protected)/(admin)/dashboard', slug)
            fs.mkdirSync(dir, { recursive: true })
            const file = path.join(dir, 'page.tsx')
            if (!fs.existsSync(file)) {
                fs.writeFileSync(
                    file,
                    `export default function ${pascal}Page() {\n    return (\n        <div className="p-6">\n            <h1 className="text-2xl font-bold tracking-tight">${name}</h1>\n        </div>\n    )\n}\n`,
                    'utf8',
                )
            }
        } catch {
            // non-fatal — dev may not have write access
        }
    }

    private deletePageFile(slug: string) {
        try {
            const dir = path.resolve(process.cwd(), '../web/src/app/(protected)/(admin)/dashboard', slug)
            if (fs.existsSync(dir)) {
                fs.rmSync(dir, { recursive: true, force: true })
            }
        } catch {
            // non-fatal
        }
    }
}
