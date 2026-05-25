import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleService } from '../../modules/rbac/role/role.service'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { ForbiddenException } from '../exceptions/app-error'

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private roleService: RoleService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        if (!required || required.length === 0) return true

        const req = context.switchToHttp().getRequest()
        const userId: string = req.user?.userId
        if (!userId) throw new ForbiddenException('Access denied')

        const userRoles = await this.roleService.getUserRoles(userId)
        const roleNames = userRoles.map((r) => r.name)

        const hasRole = required.some((r) => roleNames.includes(r))
        if (!hasRole) throw new ForbiddenException('Insufficient role')

        req.user.roles = roleNames
        return true
    }
}
