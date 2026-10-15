import { ForbiddenException } from '../exceptions/app-error'
import { PermissionsGuard } from './permissions.guard'

function setup(required: string[] | undefined, roles: string[], permissions: string[]) {
    const reflector = { getAllAndOverride: jest.fn().mockReturnValue(required) }
    const roleService = {
        getUserRoles: jest.fn().mockResolvedValue(roles.map((name) => ({ name }))),
        getUserPermissions: jest.fn().mockResolvedValue(permissions),
    }
    const req: Record<string, any> = { user: { userId: 'user-id' } }
    const context = {
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: () => ({ getRequest: () => req }),
    }
    const guard = new PermissionsGuard(reflector as never, roleService as never)
    return { run: () => guard.canActivate(context as never), req, roleService }
}

describe('PermissionsGuard', () => {
    it('allows routes without @Permissions', async () => {
        const { run, roleService } = setup(undefined, [], [])
        await expect(run()).resolves.toBe(true)
        expect(roleService.getUserRoles).not.toHaveBeenCalled()
    })

    it('lets the admin role through whatever its permission list says', async () => {
        const { run } = setup(['user:delete'], ['admin'], [])
        await expect(run()).resolves.toBe(true)
    })

    it('allows a non-admin holding every required permission', async () => {
        const { run, req } = setup(['user:read'], ['staff'], ['user:read', 'stats:read'])
        await expect(run()).resolves.toBe(true)
        // Handlers read these to make finer checks
        expect(req.user.roles).toEqual(['staff'])
        expect(req.user.permissions).toEqual(['user:read', 'stats:read'])
    })

    it('rejects a non-admin missing a required permission', async () => {
        const { run } = setup(['user:read', 'user:delete'], ['staff'], ['user:read'])
        await expect(run()).rejects.toBeInstanceOf(ForbiddenException)
    })

    it('rejects a request without an authenticated user', async () => {
        const { run, req } = setup(['user:read'], [], [])
        req.user = undefined
        await expect(run()).rejects.toBeInstanceOf(ForbiddenException)
    })
})
