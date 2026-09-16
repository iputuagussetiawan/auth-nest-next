import 'dotenv/config'

import * as bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from './schema'
import { users } from './schema/auth/users.schema'
import { permissions } from './schema/rbac/permissions.schema'
import { rolePermissions } from './schema/rbac/role-permissions.schema'
import { roles } from './schema/rbac/roles.schema'
import { userRoles } from './schema/rbac/user-roles.schema'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

const ROLES = [
    { name: 'admin', label: 'Admin', description: 'Full system access' },
    { name: 'participant', label: 'Participant', description: 'Participant account access' },
    { name: 'instructure', label: 'Instructor', description: 'Instructor account access' },
    { name: 'project_owner', label: 'Project Owner', description: 'Project owner account access' },
    {
        name: 'project_member',
        label: 'Project Member',
        description: 'Project member account access',
    },
    {
        name: 'project_mentor',
        label: 'Project Mentor',
        description: 'Project mentor account access',
    },
    { name: 'investor', label: 'Investor', description: 'Investor account access' },
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

async function seedRoles(): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    console.log('Seeding roles...')
    for (const row of ROLES) {
        const existing = await db.select().from(roles).where(eq(roles.name, row.name)).limit(1)
        if (existing.length) {
            map.set(row.name, existing[0].id)
            console.log(`  skip  role: ${row.name}`)
        } else {
            const created = await db.insert(roles).values(row).returning()
            map.set(row.name, created[0].id)
            console.log(`  seed  role: ${row.name}`)
        }
    }
    return map
}

async function seedPermissions(): Promise<Map<string, string>> {
    const map = new Map<string, string>()
    console.log('\nSeeding permissions...')
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
            const created = await db.insert(permissions).values(row).returning()
            map.set(row.name, created[0].id)
            console.log(`  seed  permission: ${row.name}`)
        }
    }
    return map
}

async function assignPermissions(roleMap: Map<string, string>, permMap: Map<string, string>) {
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

const USERS = [
    { email: 'admin@example.com', firstName: 'Alice', lastName: 'Admin', role: 'admin' },
    {
        email: 'participant@example.com',
        firstName: 'Pat',
        lastName: 'Participant',
        role: 'participant',
    },
    {
        email: 'instructure@example.com',
        firstName: 'Indy',
        lastName: 'Instructor',
        role: 'instructure',
    },
    {
        email: 'projectowner@example.com',
        firstName: 'Olivia',
        lastName: 'Owner',
        role: 'project_owner',
    },
    {
        email: 'projectmember@example.com',
        firstName: 'Mason',
        lastName: 'Member',
        role: 'project_member',
    },
    {
        email: 'projectmentor@example.com',
        firstName: 'Mira',
        lastName: 'Mentor',
        role: 'project_mentor',
    },
    { email: 'investor@example.com', firstName: 'Ivy', lastName: 'Investor', role: 'investor' },
]

async function seedUsers(roleMap: Map<string, string>) {
    console.log('\nSeeding users...')
    const password = await bcrypt.hash('Password123!', 10)
    for (const u of USERS) {
        const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1)
        if (existing.length) {
            console.log(`  skip  user: ${u.email}`)
            continue
        }
        const [created] = await db
            .insert(users)
            .values({
                email: u.email,
                firstName: u.firstName,
                lastName: u.lastName,
                password,
                provider: 'email',
                providerId: u.email,
                isEmailVerified: true,
            })
            .returning()

        const roleId = roleMap.get(u.role)
        if (roleId) await db.insert(userRoles).values({ userId: created.id, roleId })
        console.log(`  seed  user: ${u.email} (${u.role})`)
    }
}

async function main() {
    const roleMap = await seedRoles()
    const permMap = await seedPermissions()
    await assignPermissions(roleMap, permMap)
    await seedUsers(roleMap)
    console.log('\nDone.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(() => pool.end())
