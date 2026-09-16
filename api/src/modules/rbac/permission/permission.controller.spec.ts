import { PermissionController } from './permission.controller'

describe('PermissionController', () => {
    const service = {
        findAll: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    }
    const controller = new PermissionController(service as never)

    beforeEach(() => jest.clearAllMocks())

    it('wraps list and detail responses', async () => {
        const permissions = [{ id: 'permission-id', name: 'users:read' }]
        service.findAll.mockResolvedValue(permissions)
        service.findById.mockResolvedValue(permissions[0])

        await expect(controller.findAll()).resolves.toEqual({
            status: 'success',
            message: 'Permissions fetched',
            data: permissions,
        })
        await expect(controller.findOne('permission-id')).resolves.toEqual({
            status: 'success',
            message: 'Permission fetched',
            data: permissions[0],
        })
    })

    it('wraps create, update, and delete responses', async () => {
        const dto = { name: 'users:read', description: 'Read users' }
        service.create.mockResolvedValue({ id: 'permission-id', ...dto })
        service.update.mockResolvedValue({ id: 'permission-id', ...dto })
        service.remove.mockResolvedValue({ message: 'Permission deleted' })

        await expect(controller.create(dto as never)).resolves.toEqual({
            status: 'success',
            message: 'Permission created',
            data: { id: 'permission-id', ...dto },
        })
        await expect(controller.update('permission-id', dto as never)).resolves.toEqual({
            status: 'success',
            message: 'Permission updated',
            data: { id: 'permission-id', ...dto },
        })
        await expect(controller.remove('permission-id')).resolves.toEqual({ status: 'success', message: 'Permission deleted', data: null })

        expect(service.update).toHaveBeenCalledWith('permission-id', dto)
        expect(service.remove).toHaveBeenCalledWith('permission-id')
    })
})
