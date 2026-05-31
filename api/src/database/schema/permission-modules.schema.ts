import { pgTable, uuid, primaryKey } from 'drizzle-orm/pg-core'
import { permissions } from './permissions.schema'
import { appModules } from './app-modules.schema'

export const permissionModules = pgTable(
    'permission_modules',
    {
        permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
        moduleId: uuid('module_id').notNull().references(() => appModules.id, { onDelete: 'cascade' }),
    },
    (t) => [primaryKey({ columns: [t.permissionId, t.moduleId] })],
)

export type PermissionModule = typeof permissionModules.$inferSelect
