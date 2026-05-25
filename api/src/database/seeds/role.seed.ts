import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'

import type * as schema from '../schema'
import { roles } from '../schema/roles.schema'
import { permissions } from '../schema/permissions.schema'
import { rolePermissions } from '../schema/role-permissions.schema'

const ROLES = [
    { name: 'admin',     description: 'Full system access' },
    { name: 'company',   description: 'Company account access' },
    { name: 'jobseeker', description: 'Jobseeker account access' },
    { name: 'user',      description: 'Default user role' },
]

const PERMISSIONS = [
    { name: 'user:read',           description: 'Read user data' },
    { name: 'user:create',         description: 'Create users' },
    { name: 'user:update',         description: 'Update user data' },
    { name: 'user:delete',         description: 'Delete users' },
    { name: 'role:manage',         description: 'Manage roles and permissions' },
    { name: 'job:read',            description: 'Read job listings' },
    { name: 'job:create',          description: 'Create job listings' },
    { name: 'job:update',          description: 'Update job listings' },
    { name: 'job:delete',          description: 'Delete job listings' },
    { name: 'application:read',    description: 'Read job applications' },
    { name: 'application:create',  description: 'Submit job applications' },
    { name: 'application:update',  description: 'Update job applications' },
]

const ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: [
        'user:read', 'user:create', 'user:update', 'user:delete',
        'role:manage',
        'job:read', 'job:create', 'job:update', 'job:delete',
        'application:read', 'application:create', 'application:update',
    ],
    company: [
        'user:read',
        'job:read', 'job:create', 'job:update', 'job:delete',
        'application:read', 'application:update',
    ],
    jobseeker: [
        'user:read',
        'job:read',
        'application:read', 'application:create',
    ],
}

async function seedRoles(db: NodePgDatabase<typeof schema>): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    console.log('Seeding roles...')
    for (const row of ROLES) {
        const existing = await db.select().from(roles).where(eq(roles.name, row.name)).limit(1)
        if (existing.length) {
            map.set(row.name, existing[0].id)
            console.log(`  skip  role: ${row.name}`)
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
    console.log('\nSeeding permissions...')
    for (const row of PERMISSIONS) {
        const existing = await db.select().from(permissions).where(eq(permissions.name, row.name)).limit(1)
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
