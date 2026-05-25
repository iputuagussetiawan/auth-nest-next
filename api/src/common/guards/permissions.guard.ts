import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleService } from '../../modules/rbac/role/role.service'
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator'
import { ForbiddenException } from '../exceptions/app-error'

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

        const userPermissions = await this.roleService.getUserPermissions(userId)
        const hasAll = required.every((p) => userPermissions.includes(p))
        if (!hasAll) throw new ForbiddenException('Insufficient permissions')

        req.user.permissions = userPermissions
        return true
    }
}
