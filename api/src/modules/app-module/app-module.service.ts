import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, inArray } from 'drizzle-orm'
import * as fs from 'fs'
import * as path from 'path'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { appModules } from '../../database/schema/app-modules.schema'
import { roleModules } from '../../database/schema/role-modules.schema'
import { permissionModules } from '../../database/schema/permission-modules.schema'
import { permissions } from '../../database/schema/permissions.schema'
import { userRoles } from '../../database/schema/user-roles.schema'
import { rolePermissions } from '../../database/schema/role-permissions.schema'
import { NotFoundException } from '../../common/exceptions/app-error'
import { CreateAppModuleDto } from './dto/create-app-module.dto'
import { UpdateAppModuleDto } from './dto/update-app-module.dto'

const ACTIONS = ['view', 'create', 'update', 'delete'] as const

function modulePermNames(slug: string) {
    return ACTIONS.map((a) => `${slug}:${a}`)
}

@Injectable()
export class AppModuleService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async getAll() {
        const rows = await this.db.select().from(appModules).orderBy(appModules.order)
        const allRoleModules = await this.db.select().from(roleModules)
        const allPermModules = await this.db.select().from(permissionModules)

        return rows.map((m) => ({
            ...m,
            roleIds: allRoleModules.filter((rm) => rm.moduleId === m.id).map((rm) => rm.roleId),
            permissionIds: allPermModules.filter((pm) => pm.moduleId === m.id).map((pm) => pm.permissionId),
        }))
    }

    async create(dto: CreateAppModuleDto) {
        const { roleIds, permissionIds, ...rest } = dto
        const [created] = await this.db
            .insert(appModules)
            .values({ ...rest, isActive: rest.isActive ?? true })
            .returning()

        if (roleIds?.length) {
            await this.db.insert(roleModules).values(
                roleIds.map((roleId) => ({ roleId, moduleId: created.id })),
            )
        }

        // Auto-seed permissions for this module, then merge with any manually supplied ones
        const autoPermIds = await this.seedModulePermissions(created.id, created.slug, created.name)
        const mergedPermIds = [...new Set([...autoPermIds, ...(permissionIds ?? [])])]

        // Link any manually supplied permissions not already seeded
        const extra = mergedPermIds.filter((id) => !autoPermIds.includes(id))
        if (extra.length) {
            await this.db.insert(permissionModules).values(
                extra.map((permissionId) => ({ permissionId, moduleId: created.id })),
            )
        }

        this.writePageFile(created.slug, created.name)

        return { ...created, roleIds: roleIds ?? [], permissionIds: mergedPermIds }
    }

    async update(id: string, dto: UpdateAppModuleDto) {
        const [existing] = await this.db.select().from(appModules).where(eq(appModules.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Module not found')

        const { roleIds, permissionIds, ...rest } = dto
        const slugChanged = rest.slug && rest.slug !== existing.slug
        const newSlug = rest.slug ?? existing.slug
        const newName = rest.name ?? existing.name

        if (slugChanged) {
            await this.renameModulePermissions(existing.slug, newSlug, newName)
        }

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

        if (permissionIds !== undefined) {
            await this.db.delete(permissionModules).where(eq(permissionModules.moduleId, id))
            if (permissionIds.length) {
                await this.db.insert(permissionModules).values(
                    permissionIds.map((permissionId) => ({ permissionId, moduleId: id })),
                )
            }
        }

        const finalRoleIds = roleIds ?? (await this.db.select({ roleId: roleModules.roleId }).from(roleModules).where(eq(roleModules.moduleId, id))).map((r) => r.roleId)
        const finalPermIds = permissionIds ?? (await this.db.select({ permissionId: permissionModules.permissionId }).from(permissionModules).where(eq(permissionModules.moduleId, id))).map((p) => p.permissionId)

        return { ...updated, roleIds: finalRoleIds, permissionIds: finalPermIds }
    }

    async delete(id: string) {
        const [existing] = await this.db.select().from(appModules).where(eq(appModules.id, id)).limit(1)
        if (!existing) throw new NotFoundException('Module not found')

        // Delete auto-generated permissions (cascades permission_modules rows too)
        await this.cleanModulePermissions(existing.slug)

        await this.db.delete(appModules).where(eq(appModules.id, id))
        this.deletePageFile(existing.slug)
        return { message: 'Module deleted' }
    }

    async getMyModules(userId: string) {
        const userRoleRows = await this.db
            .select({ roleId: userRoles.roleId })
            .from(userRoles)
            .where(eq(userRoles.userId, userId))
        const userRoleId = userRoleRows[0]?.roleId ?? null

        const userPermIds: string[] = []
        if (userRoleId) {
            const permRows = await this.db
                .select({ permissionId: rolePermissions.permissionId })
                .from(rolePermissions)
                .where(eq(rolePermissions.roleId, userRoleId))
            userPermIds.push(...permRows.map((r) => r.permissionId))
        }

        const all = await this.getAll()

        return all.filter((m) => {
            if (!m.isActive) return false
            const unrestricted = m.roleIds.length === 0 && m.permissionIds.length === 0
            const roleMatch = userRoleId ? m.roleIds.includes(userRoleId) : false
            const permMatch = userPermIds.some((pid) => m.permissionIds.includes(pid))
            return unrestricted || roleMatch || permMatch
        })
    }

    async reorder(ids: string[]) {
        await Promise.all(
            ids.map((id, index) =>
                this.db.update(appModules).set({ order: index, updatedAt: new Date() }).where(eq(appModules.id, id)),
            ),
        )
        return { message: 'Modules reordered' }
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    /**
     * Creates view/create/update/delete permissions for a module slug,
     * links them to the module, and returns their IDs.
     * Uses ON CONFLICT DO NOTHING so re-running is safe.
     */
    private async seedModulePermissions(moduleId: string, slug: string, name: string): Promise<string[]> {
        const entries = ACTIONS.map((action) => ({
            name: `${slug}:${action}`,
            description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${name}`,
        }))

        // Insert, skip duplicates
        await this.db.insert(permissions).values(entries).onConflictDoNothing()

        // Fetch by name to get IDs (whether newly created or pre-existing)
        const names = entries.map((e) => e.name)
        const rows = await this.db
            .select({ id: permissions.id, name: permissions.name })
            .from(permissions)
            .where(inArray(permissions.name, names))

        // Link all to the module (skip already linked)
        if (rows.length) {
            await this.db
                .insert(permissionModules)
                .values(rows.map((r) => ({ permissionId: r.id, moduleId })))
                .onConflictDoNothing()
        }

        return rows.map((r) => r.id)
    }

    /**
     * Renames auto-generated permissions when a module's slug changes.
     */
    private async renameModulePermissions(oldSlug: string, newSlug: string, newName: string) {
        for (const action of ACTIONS) {
            const oldName = `${oldSlug}:${action}`
            const newPermName = `${newSlug}:${action}`
            const description = `${action.charAt(0).toUpperCase() + action.slice(1)} ${newName}`

            await this.db
                .update(permissions)
                .set({ name: newPermName, description, updatedAt: new Date() })
                .where(eq(permissions.name, oldName))
        }
    }

    /**
     * Deletes auto-generated permissions for a module slug.
     * Cascade on permission_modules handles junction cleanup.
     */
    private async cleanModulePermissions(slug: string) {
        const names = modulePermNames(slug)
        await this.db.delete(permissions).where(inArray(permissions.name, names))
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
            // non-fatal
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
