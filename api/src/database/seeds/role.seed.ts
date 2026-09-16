import { eq, notInArray } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import type * as schema from '../schema'
import { permissions } from '../schema/rbac/permissions.schema'
import { rolePermissions } from '../schema/rbac/role-permissions.schema'
import { roles } from '../schema/rbac/roles.schema'

const ROLES = [
    { name: 'admin', label: 'Admin', description: 'Full system access', icon: 'ShieldCheck' },
    {
        name: 'participant',
        label: 'Participant',
        description: 'Participant account access',
        icon: 'User',
    },
    {
        name: 'instructure',
        label: 'Instructor',
        description: 'Instructor account access',
        icon: 'GraduationCap',
    },
    {
        name: 'project_owner',
        label: 'Project Owner',
        description: 'Project owner account access',
        icon: 'Crown',
    },
    {
        name: 'project_member',
        label: 'Project Member',
        description: 'Project member account access',
        icon: 'Users',
    },
    {
        name: 'project_mentor',
        label: 'Project Mentor',
        description: 'Project mentor account access',
        icon: 'Compass',
    },
    {
        name: 'investor',
        label: 'Investor',
        description: 'Investor account access',
        icon: 'Landmark',
    },
]

const PERMISSIONS = [
    { name: 'user:read', description: 'Read user data' },
    { name: 'user:create', description: 'Create users' },
    { name: 'user:update', description: 'Update user data' },
    { name: 'user:delete', description: 'Delete users' },
    { name: 'role:manage', description: 'Manage roles and permissions' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: ['user:read', 'user:create', 'user:update', 'user:delete', 'role:manage'],
    participant: ['user:read'],
    instructure: ['user:read'],
    project_owner: ['user:read'],
    project_member: ['user:read'],
    project_mentor: ['user:read'],
    investor: ['user:read'],
}

async function seedRoles(db: NodePgDatabase<typeof schema>): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    const roleNames = ROLES.map((role) => role.name)
    console.log('Seeding roles...')

    await db.delete(roles).where(notInArray(roles.name, roleNames))

    for (const row of ROLES) {
        const existing = await db.select().from(roles).where(eq(roles.name, row.name)).limit(1)
        if (existing.length) {
            map.set(row.name, existing[0].id)
            await db
                .update(roles)
                .set({ label: row.label, description: row.description, icon: row.icon })
                .where(eq(roles.id, existing[0].id))
            console.log(`  update role: ${row.name}`)
        } else {
            const [created] = await db.insert(roles).values(row).returning()
            map.set(row.name, created.id)
            console.log(`  seed  role: ${row.name}`)
        }
    }
    return map
}

async function seedPermissions(db: NodePgDatabase<typeof schema>): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    const permNames = PERMISSIONS.map((perm) => perm.name)
    console.log('\nSeeding permissions...')

    await db.delete(permissions).where(notInArray(permissions.name, permNames))

    for (const row of PERMISSIONS) {
        const existing = await db
            .select()
            .from(permissions)
            .where(eq(permissions.name, row.name))
            .limit(1)
        if (existing.length) {
            map.set(row.name, existing[0].id)
            console.log(`  skip  permission: ${row.name}`)
        } else {
            const [created] = await db.insert(permissions).values(row).returning()
            map.set(row.name, created.id)
            console.log(`  seed  permission: ${row.name}`)
        }
    }
    return map
}

async function assignPermissions(
    db: NodePgDatabase<typeof schema>,
    roleMap: Map<string, string>,
    permMap: Map<string, string>,
) {
    console.log('\nAssigning permissions to roles...')
    for (const [roleName, permNames] of Object.entries(ROLE_PERMISSIONS)) {
        const roleId = roleMap.get(roleName)
        if (!roleId) continue

        await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId))

        const pairs = permNames
            .map((p) => permMap.get(p))
            .filter((id): id is string => !!id)
            .map((permissionId) => ({ roleId, permissionId }))

        if (pairs.length) await db.insert(rolePermissions).values(pairs)
        console.log(`  ${roleName} -> [${permNames.join(', ')}]`)
    }
}

export async function runRoleSeed(db: NodePgDatabase<typeof schema>): Promise<Map<string, string>> {
    const roleMap = await seedRoles(db)
    const permMap = await seedPermissions(db)
    await assignPermissions(db, roleMap, permMap)
    return roleMap
}
