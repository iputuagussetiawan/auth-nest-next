import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, inArray } from 'drizzle-orm'

import { DRIZZLE } from '../../../database/drizzle.provider'
import * as schema from '../../../database/schema'
import { roles, type Role } from '../../../database/schema/roles.schema'
import { rolePermissions } from '../../../database/schema/role-permissions.schema'
import { userRoles } from '../../../database/schema/user-roles.schema'
import { permissions } from '../../../database/schema/permissions.schema'
import { BadRequestException, NotFoundException } from '../../../common/exceptions/app-error'
import type { CreateRoleDto } from './dto/create-role.dto'

@Injectable()
export class RoleService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async findAll() {
        return this.db.select().from(roles)
    }

    async findById(id: string) {
        const [role] = await this.db.select().from(roles).where(eq(roles.id, id)).limit(1)
        if (!role) throw new NotFoundException('Role not found')
        return role
    }

    async findByName(name: string) {
        const [role] = await this.db.select().from(roles).where(eq(roles.name, name)).limit(1)
        return role ?? null
    }

    async create(dto: CreateRoleDto) {
        const existing = await this.findByName(dto.name)
        if (existing) throw new BadRequestException('Role already exists')

        const [role] = await this.db.insert(roles).values({ name: dto.name, description: dto.description }).returning()
        return role
    }

    async update(id: string, dto: Partial<CreateRoleDto>) {
        await this.findById(id)
        const [updated] = await this.db
            .update(roles)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(roles.id, id))
            .returning()
        return updated
    }

    async remove(id: string) {
        await this.findById(id)
        await this.db.delete(roles).where(eq(roles.id, id))
        return { message: 'Role deleted' }
    }

    async updateRoleImage(id: string, imageUrl: string) {
        await this.findById(id)
        const [updated] = await this.db
            .update(roles)
            .set({ icon: imageUrl, updatedAt: new Date() })
            .where(eq(roles.id, id))
            .returning()
        return updated
    }

    async assignPermissions(roleId: string, permissionIds: string[]) {
        await this.findById(roleId)
        await this.db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))
        if (permissionIds.length) {
            await this.db.insert(rolePermissions).values(
                permissionIds.map((permissionId) => ({ roleId, permissionId })),
            )
        }
        return { message: 'Permissions assigned' }
    }

    async findAllWithPermissions() {
        const allRoles = await this.findAll()
        return Promise.all(
            allRoles.map(async (role) => ({
                ...role,
                permissions: await this.getRolePermissions(role.id),
            })),
        )
    }

    async getRolePermissions(roleId: string) {
        const rows = await this.db
            .select({ permission: permissions })
            .from(rolePermissions)
            .innerJoin(permissions as any, eq(rolePermissions.permissionId, permissions.id))
            .where(eq(rolePermissions.roleId, roleId))
        return rows.map((r) => r.permission)
    }

    async assignRoleToUser(userId: string, roleId: string) {
        await this.findById(roleId)
        const existing = await this.db
            .select()
            .from(userRoles)
            .where(eq(userRoles.userId, userId))
            .limit(1)

        if (existing.length) {
            await this.db
                .update(userRoles)
                .set({ roleId })
                .where(eq(userRoles.userId, userId))
        } else {
            await this.db.insert(userRoles).values({ userId, roleId })
        }
        return { message: 'Role assigned to user' }
    }

    async removeRoleFromUser(userId: string) {
        await this.db.delete(userRoles).where(eq(userRoles.userId, userId))
        return { message: 'Role removed from user' }
    }

    async getUserRoles(userId: string): Promise<Role[]> {
        const rows = await this.db
            .select({ role: roles })
            .from(userRoles)
            .innerJoin(roles as any, eq(userRoles.roleId, roles.id))
            .where(eq(userRoles.userId, userId))
        return rows.map((r) => r.role)
    }

    async getUserPermissions(userId: string): Promise<string[]> {
        const userRoleRows = await this.db
            .select({ roleId: userRoles.roleId })
            .from(userRoles)
            .where(eq(userRoles.userId, userId))

        if (!userRoleRows.length) return []

        const roleIds = userRoleRows.map((r) => r.roleId)
        const rows = await this.db
            .select({ name: permissions.name })
            .from(rolePermissions)
            .innerJoin(permissions as any, eq(rolePermissions.permissionId, permissions.id))
            .where(inArray(rolePermissions.roleId, roleIds))

        return [...new Set(rows.map((r) => r.name))]
    }
}
