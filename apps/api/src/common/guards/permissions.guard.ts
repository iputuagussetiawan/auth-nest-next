import { ADMIN_ROLE } from '@nest-auth/shared'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { RoleService } from '../../modules/rbac/role/role.service'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { ForbiddenException } from '../exceptions/app-error'

/**
 * Allows the request if the user has every permission listed in @Permissions(). The admin role
 * always passes, so admins keep full access whatever their role's permission list says.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private roleService: RoleService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!required || required.length === 0) return true

        const req = context.switchToHttp().getRequest()
        const userId: string = req.user?.userId
        if (!userId) throw new ForbiddenException('Access denied')

        const [userRoles, userPermissions] = await Promise.all([
            this.roleService.getUserRoles(userId),
            this.roleService.getUserPermissions(userId),
        ])
        const roleNames = userRoles.map((r) => r.name)
        req.user.roles = roleNames
        req.user.permissions = userPermissions

        if (roleNames.includes(ADMIN_ROLE)) return true
        if (!required.every((p) => userPermissions.includes(p))) {
            throw new ForbiddenException('Insufficient permissions')
        }
        return true
    }
}
