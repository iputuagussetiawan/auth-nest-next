import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, gt, sql } from 'drizzle-orm'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { users } from '../../database/schema/users.schema'
import { sessions } from '../../database/schema/sessions.schema'
import { roles } from '../../database/schema/roles.schema'
import { userRoles } from '../../database/schema/user-roles.schema'
import { appModules } from '../../database/schema/app-modules.schema'
import { permissions } from '../../database/schema/permissions.schema'

@Injectable()
export class AdminStatsService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    async getStats() {
        const [
            totalUsersRows,
            activeUsersRows,
            unverifiedRows,
            activeSessionsRows,
            totalRolesRows,
            totalModulesRows,
            totalPermissionsRows,
            usersByRole,
            userGrowth,
            sessionGrowth,
        ] = await Promise.all([
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(users),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(users).where(eq(users.isActive, true)),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(users).where(eq(users.isEmailVerified, false)),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(sessions).where(gt(sessions.expiredAt, new Date())),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(roles),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(appModules),
            this.db.select({ v: sql<number>`cast(count(*) as int)` }).from(permissions),

            this.db
                .select({
                    role: roles.name,
                    count: sql<number>`cast(count(*) as int)`,
                })
                .from(userRoles)
                .innerJoin(roles, eq(userRoles.roleId, roles.id))
                .groupBy(roles.name)
                .orderBy(roles.name),

            this.db
                .select({
                    month: sql<string>`to_char(date_trunc('month', ${users.createdAt}), 'Mon YYYY')`,
                    sort: sql<string>`date_trunc('month', ${users.createdAt})`,
                    users: sql<number>`cast(count(*) as int)`,
                })
                .from(users)
                .where(sql`${users.createdAt} >= date_trunc('month', now()) - interval '5 months'`)
                .groupBy(sql`date_trunc('month', ${users.createdAt})`)
                .orderBy(sql`date_trunc('month', ${users.createdAt})`),

            this.db
                .select({
                    month: sql<string>`to_char(date_trunc('month', ${sessions.createdAt}), 'Mon YYYY')`,
                    sessions: sql<number>`cast(count(*) as int)`,
                })
                .from(sessions)
                .where(sql`${sessions.createdAt} >= date_trunc('month', now()) - interval '5 months'`)
                .groupBy(sql`date_trunc('month', ${sessions.createdAt})`)
                .orderBy(sql`date_trunc('month', ${sessions.createdAt})`),
        ])

        const sessionMap = new Map(sessionGrowth.map(r => [r.month, r.sessions]))

        return {
            totalUsers: totalUsersRows[0]?.v ?? 0,
            activeUsers: activeUsersRows[0]?.v ?? 0,
            unverifiedEmails: unverifiedRows[0]?.v ?? 0,
            activeSessions: activeSessionsRows[0]?.v ?? 0,
            totalRoles: totalRolesRows[0]?.v ?? 0,
            totalModules: totalModulesRows[0]?.v ?? 0,
            totalPermissions: totalPermissionsRows[0]?.v ?? 0,
            usersByRole: usersByRole.map(r => ({ role: r.role ?? 'Unknown', count: r.count })),
            userGrowth: userGrowth.map(r => ({
                month: r.month.split(' ')[0], // 'Jan YYYY' → 'Jan'
                users: r.users,
                sessions: sessionMap.get(r.month) ?? 0,
            })),
        }
    }
}
