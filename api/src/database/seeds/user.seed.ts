import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as bcrypt from 'bcrypt'

import type * as schema from '../schema'
import { users } from '../schema/users.schema'
import { userRoles } from '../schema/user-roles.schema'

const USERS = [
    { email: 'admin@example.com',     firstName: 'Alice', lastName: 'Admin',    role: 'admin',     profilePicture: 'https://i.pravatar.cc/150?u=admin@example.com' },
    { email: 'company@example.com',   firstName: 'Bob',   lastName: 'Company',  role: 'company',   profilePicture: 'https://i.pravatar.cc/150?u=company@example.com' },
    { email: 'jobseeker@example.com', firstName: 'Carol', lastName: 'Seeker',   role: 'jobseeker', profilePicture: 'https://i.pravatar.cc/150?u=jobseeker@example.com' },
    { email: 'user@example.com',      firstName: 'Dave',  lastName: 'User',     role: 'user',      profilePicture: 'https://i.pravatar.cc/150?u=user@example.com' },
]

export async function runUserSeed(db: NodePgDatabase<typeof schema>, roleMap: Map<string, string>) {
    console.log('\nSeeding users...')
    const password = await bcrypt.hash('Password123!', 10)

    for (const u of USERS) {
        const existing = await db.select().from(users).where(eq(users.email, u.email)).limit(1)
        if (existing.length) {
            console.log(`  skip  user: ${u.email}`)
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
