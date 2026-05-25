import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { users } from './users.schema'
import { roles } from './roles.schema'

export const userRoles = pgTable(
    'user_roles',
    {
        userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
        roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.userId, t.roleId] })],
)

export type UserRole = typeof userRoles.$inferSelect
