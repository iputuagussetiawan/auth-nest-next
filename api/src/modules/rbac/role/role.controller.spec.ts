import { RoleController } from './role.controller'

describe('RoleController', () => {
    const service = {
        findAll: jest.fn(),
        findAllWithPermissions: jest.fn(),
        findById: jest.fn(),
        getRolePermissions: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        updateRoleImage: jest.fn(),
        assignPermissions: jest.fn(),
        assignRoleToUser: jest.fn(),
        removeRoleFromUser: jest.fn(),
        getUserRoles: jest.fn(),
    }
    const cloudinary = { upload: jest.fn() }
    const controller = new RoleController(service as never, cloudinary as never)

    beforeEach(() => jest.clearAllMocks())

    it('wraps role list responses', async () => {
        const data = [{ id: 'role-id' }]
        service.findAll.mockResolvedValue(data)

        await expect(controller.findAll()).resolves.toEqual({ status: 'success', message: 'Roles fetched', data })
        expect(service.findAll).toHaveBeenCalledTimes(1)
    })

    it('wraps role details and permission responses', async () => {
        service.findById.mockResolvedValue({ id: 'role-id' })
        service.getRolePermissions.mockResolvedValue([{ id: 'permission-id' }])

        await expect(controller.findOne('role-id')).resolves.toEqual({
            status: 'success',
            message: 'Role fetched',
            data: { id: 'role-id' },
        })
        await expect(controller.getRolePermissions('role-id')).resolves.toEqual({
            status: 'success',
            message: 'Role permissions fetched',
            data: [{ id: 'permission-id' }],
        })
    })

    it('wraps create, update, and delete responses', async () => {
        const dto = { name: 'editor' }
        service.create.mockResolvedValue({ id: 'role-id' })
        service.update.mockResolvedValue({ id: 'role-id', name: 'editor' })
        service.remove.mockResolvedValue({ message: 'Role deleted' })

        await expect(controller.create(dto as never)).resolves.toEqual({
            status: 'success',
            message: 'Role created',
            data: { id: 'role-id' },
        })
        await expect(controller.update('role-id', dto as never)).resolves.toEqual({
            status: 'success',
            message: 'Role updated',
            data: { id: 'role-id', name: 'editor' },
        })
        await expect(controller.remove('role-id')).resolves.toEqual({ status: 'success', message: 'Role deleted', data: null })
        expect(service.update).toHaveBeenCalledWith('role-id', dto)
        expect(service.remove).toHaveBeenCalledWith('role-id')
    })

    it('uploads an image and updates the role', async () => {
        const file = { buffer: Buffer.from('image') }
        cloudinary.upload.mockResolvedValue({ secure_url: 'https://image.test/role.png' })
        service.updateRoleImage.mockResolvedValue({ id: 'role-id', icon: 'https://image.test/role.png' })

        await expect(controller.uploadImage('role-id', file as never)).resolves.toEqual({
            status: 'success',
            message: 'Role image updated',
            data: { id: 'role-id', icon: 'https://image.test/role.png' },
        })
        expect(cloudinary.upload).toHaveBeenCalledWith(file, 'role-images')
        expect(service.updateRoleImage).toHaveBeenCalledWith('role-id', 'https://image.test/role.png')
    })

    it('forwards permission and user-role operations', async () => {
        service.assignPermissions.mockResolvedValue({ message: 'Permissions assigned' })
        service.assignRoleToUser.mockResolvedValue({ message: 'Role assigned to user' })
        service.removeRoleFromUser.mockResolvedValue({ message: 'Role removed from user' })
        service.getUserRoles.mockResolvedValue([{ id: 'role-id' }])

        await expect(controller.assignPermissions('role-id', { permissionIds: ['permission-id'] })).resolves.toEqual({
            message: 'Permissions assigned',
        })
        await expect(controller.assignRoleToUser('user-id', { roleId: 'role-id' })).resolves.toEqual({
            message: 'Role assigned to user',
        })
        await expect(controller.removeRoleFromUser('user-id')).resolves.toEqual({ message: 'Role removed from user' })
        await expect(controller.getUserRoles('user-id')).resolves.toEqual([{ id: 'role-id' }])

        expect(service.assignPermissions).toHaveBeenCalledWith('role-id', ['permission-id'])
        expect(service.assignRoleToUser).toHaveBeenCalledWith('user-id', 'role-id')
        expect(service.removeRoleFromUser).toHaveBeenCalledWith('user-id')
        expect(service.getUserRoles).toHaveBeenCalledWith('user-id')
    })
})
