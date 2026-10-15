import { PERMISSIONS as P } from '@nest-auth/shared'
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

// Must match the permissions the API enforces (PERMISSIONS in @nest-auth/shared)
const PERMISSIONS = [
    { name: P.USER_READ, description: 'List and view users' },
    { name: P.USER_CREATE, description: 'Create users' },
    { name: P.USER_UPDATE, description: 'Edit users and activate or deactivate them' },
    { name: P.USER_DELETE, description: 'Delete users' },
    { name: P.ROLE_MANAGE, description: 'Manage roles and permissions and assign roles' },
    { name: P.THEME_MANAGE, description: 'Create, edit and activate themes' },
    { name: P.SETTINGS_MANAGE, description: 'Edit site settings and upload site assets' },
    { name: P.STATS_READ, description: 'View dashboard statistics' },
]

// Admin passes every check anyway; the list just keeps the Roles page accurate. Other roles start
// with nothing because every permission now unlocks real admin endpoints.
const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: PERMISSIONS.map((p) => p.name),
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
