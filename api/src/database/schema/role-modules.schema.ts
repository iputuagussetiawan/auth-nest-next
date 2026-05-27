import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { roles } from './roles.schema'
import { appModules } from './app-modules.schema'

export const roleModules = pgTable(
    'role_modules',
    {
        roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
        moduleId: uuid('module_id').notNull().references(() => appModules.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.roleId, t.moduleId] })],
)

export type RoleModule = typeof roleModules.$inferSelect
