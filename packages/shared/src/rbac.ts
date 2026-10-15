/** Holders of this role pass every permission check, so admins can never lock themselves out */
export const ADMIN_ROLE = 'admin'

/** Given to every new sign-up (email or Google); starts with no permissions */
export const DEFAULT_ROLE = 'user'

/** Permissions the API enforces. Grant them to non-admin roles from the Roles page. */
export const PERMISSIONS = {
    USER_READ: 'user:read',
    USER_CREATE: 'user:create',
    USER_UPDATE: 'user:update',
    USER_DELETE: 'user:delete',
    ROLE_MANAGE: 'role:manage',
    THEME_MANAGE: 'theme:manage',
    SETTINGS_MANAGE: 'settings:manage',
    STATS_READ: 'stats:read',
} as const

export type PermissionName = (typeof PERMISSIONS)[keyof typeof PERMISSIONS]
