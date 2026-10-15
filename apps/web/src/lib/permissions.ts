import { ADMIN_ROLE, type PermissionName } from '@nest-auth/shared'

import type { IUserProfile } from '@/features/admin/account/types/AccountTypes'

/** Mirrors the API's PermissionsGuard: admins can do everything, others need the permission */
export function hasPermission(user: IUserProfile | undefined, permission: PermissionName) {
    if (!user) return false
    return user.role === ADMIN_ROLE || user.permissions.includes(permission)
}
