import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as bcrypt from 'bcrypt'

import type * as schema from '../schema'
import { users } from '../schema/auth/users.schema'
import { userRoles } from '../schema/rbac/user-roles.schema'

const USERS = [
    { email: 'admin@example.com',            firstName: 'Alice',  lastName: 'Admin',         role: 'admin',          profilePicture: 'https://i.pravatar.cc/150?u=admin@example.com' },
    { email: 'participant@example.com',      firstName: 'Pat',    lastName: 'Participant',   role: 'participant',    profilePicture: 'https://i.pravatar.cc/150?u=participant@example.com' },
    { email: 'instructure@example.com',      firstName: 'Indy',   lastName: 'Instructor',    role: 'instructure',    profilePicture: 'https://i.pravatar.cc/150?u=instructure@example.com' },
    { email: 'projectowner@example.com',     firstName: 'Olivia', lastName: 'Owner',         role: 'project_owner',  profilePicture: 'https://i.pravatar.cc/150?u=projectowner@example.com' },
    { email: 'projectmember@example.com',    firstName: 'Mason',  lastName: 'Member',        role: 'project_member', profilePicture: 'https://i.pravatar.cc/150?u=projectmember@example.com' },
    { email: 'projectmentor@example.com',    firstName: 'Mira',   lastName: 'Mentor',        role: 'project_mentor', profilePicture: 'https://i.pravatar.cc/150?u=projectmentor@example.com' },
    { email: 'investor@example.com',         firstName: 'Ivy',    lastName: 'Investor',      role: 'investor',       profilePicture: 'https://i.pravatar.cc/150?u=investor@example.com' },
]

export async function runUserSeed(db: NodePgDatabase<typeof schema>, roleMap: Map<string, string>) {
    console.log('\nSeeding users...')
    const password = await bcrypt.hash('Password123!', 10)

    for (const u of USERS) {
        const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1)
        if (existing.length) {
            const roleId = roleMap.get(u.role)
            if (roleId) {
                await db.delete(userRoles).where(eq(userRoles.userId, existing[0].id))
                await db.insert(userRoles).values({ userId: existing[0].id, roleId })
            }
            console.log(`  update user: ${u.email} (${u.role})`)
            continue
        }

        const [created] = await db.insert(users).values({
            email: u.email,
            firstName: u.firstName,
            lastName: u.lastName,
            password,
            profilePicture: u.profilePicture,
            provider: 'email',
            providerId: u.email,
            isEmailVerified: true,
        }).returning()

        const roleId = roleMap.get(u.role)
        if (roleId) await db.insert(userRoles).values({ userId: created.id, roleId })
        console.log(`  seed  user: ${u.email} (${u.role})`)
    }
}
