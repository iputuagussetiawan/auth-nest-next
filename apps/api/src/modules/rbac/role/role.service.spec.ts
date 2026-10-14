import { BadRequestException, NotFoundException } from '../../../common/exceptions/app-error'
import { RoleService } from './role.service'

function createQuery(result: unknown[]) {
    return {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
        then: jest.fn((resolve: (value: unknown[]) => unknown) => resolve(result)),
    }
}

function createInsertQuery(result: unknown[]) {
    return {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(result),
    }
}

function createUpdateQuery(result: unknown[]) {
    return {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(result),
    }
}

function createDeleteQuery() {
    return { where: jest.fn().mockResolvedValue(undefined) }
}

describe('RoleService', () => {
    it('lists roles and finds a role by ID', async () => {
        const role = { id: 'role-id', name: 'admin' }
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery([role]))
                .mockReturnValueOnce(createQuery([role])),
        }
        const service = new RoleService(db as never)

        await expect(service.findAll()).resolves.toEqual([role])
        await expect(service.findById('role-id')).resolves.toEqual(role)
    })

    it('throws when a role ID does not exist', async () => {
        const db = { select: jest.fn().mockReturnValue(createQuery([])) }
        const service = new RoleService(db as never)

        await expect(service.findById('missing-id')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('creates a role and rejects duplicate names', async () => {
        const created = { id: 'role-id', name: 'editor' }
        const insert = createInsertQuery([created])
        const db = {
            select: jest.fn().mockReturnValue(createQuery([])),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new RoleService(db as never)

        await expect(service.create({ name: 'editor', label: 'Editor' })).resolves.toEqual(created)
        expect(insert.values).toHaveBeenCalledWith({
            name: 'editor',
            label: 'Editor',
            description: undefined,
        })

        const duplicateDb = {
            select: jest.fn().mockReturnValue(createQuery([{ id: 'existing-id' }])),
        }
        await expect(
            new RoleService(duplicateDb as never).create({ name: 'editor' }),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('updates a role and rejects a conflicting name', async () => {
        const current = { id: 'role-id', name: 'editor' }
        const update = createUpdateQuery([{ ...current, label: 'Updated' }])
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery([current]))
                .mockReturnValueOnce(createQuery([])),
            update: jest.fn().mockReturnValue(update),
        }
        const service = new RoleService(db as never)

        await expect(
            service.update('role-id', { name: 'editor', label: 'Updated' }),
        ).resolves.toEqual({
            id: 'role-id',
            name: 'editor',
            label: 'Updated',
        })
        expect(update.set).toHaveBeenCalledWith(
            expect.objectContaining({ label: 'Updated', updatedAt: expect.any(Date) }),
        )

        const duplicateDb = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery([current]))
                .mockReturnValueOnce(createQuery([{ id: 'other-role', name: 'admin' }])),
        }
        await expect(
            new RoleService(duplicateDb as never).update('role-id', { name: 'admin' }),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('deletes a role and updates its image', async () => {
        const role = { id: 'role-id', name: 'editor' }
        const update = createUpdateQuery([{ ...role, icon: 'image-url' }])
        const del = createDeleteQuery()
        const db = {
            select: jest.fn().mockReturnValue(createQuery([role])),
            update: jest.fn().mockReturnValue(update),
            delete: jest.fn().mockReturnValue(del),
        }
        const service = new RoleService(db as never)

        await expect(service.updateRoleImage('role-id', 'image-url')).resolves.toEqual({
            ...role,
            icon: 'image-url',
        })
        await expect(service.remove('role-id')).resolves.toEqual({ message: 'Role deleted' })
        expect(del.where).toHaveBeenCalled()
    })

    it('replaces role permissions and skips insert for an empty list', async () => {
        const del = createDeleteQuery()
        const insert = createInsertQuery([])
        const db = {
            select: jest.fn().mockReturnValue(createQuery([{ id: 'role-id' }])),
            delete: jest.fn().mockReturnValue(del),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new RoleService(db as never)

        await expect(
            service.assignPermissions('role-id', ['permission-a', 'permission-b']),
        ).resolves.toEqual({
            message: 'Permissions assigned',
        })
        expect(insert.values).toHaveBeenCalledWith([
            { roleId: 'role-id', permissionId: 'permission-a' },
            { roleId: 'role-id', permissionId: 'permission-b' },
        ])

        await expect(service.assignPermissions('role-id', [])).resolves.toEqual({
            message: 'Permissions assigned',
        })
        expect(db.insert).toHaveBeenCalledTimes(1)
    })

    it('returns roles with permissions and user counts', async () => {
        const roles = [
            { id: 'role-a', name: 'admin' },
            { id: 'role-b', name: 'user' },
        ]
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery(roles))
                .mockReturnValueOnce(createQuery([{ roleId: 'role-a', count: 2 }]))
                .mockReturnValueOnce(
                    createQuery([{ permission: { id: 'permission-a', name: 'users:read' } }]),
                )
                .mockReturnValueOnce(createQuery([])),
        }
        const service = new RoleService(db as never)

        await expect(service.findAllWithPermissions()).resolves.toEqual([
            {
                ...roles[0],
                permissions: [{ id: 'permission-a', name: 'users:read' }],
                userCount: 2,
            },
            { ...roles[1], permissions: [], userCount: 0 },
        ])
    })

    it('assigns, replaces, and removes a user role', async () => {
        const update = createUpdateQuery([])
        const insert = createInsertQuery([])
        const del = createDeleteQuery()
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery([{ id: 'role-id' }]))
                .mockReturnValueOnce(createQuery([{ userId: 'user-id', roleId: 'old-role' }]))
                .mockReturnValueOnce(createQuery([{ id: 'role-id' }]))
                .mockReturnValueOnce(createQuery([])),
            update: jest.fn().mockReturnValue(update),
            insert: jest.fn().mockReturnValue(insert),
            delete: jest.fn().mockReturnValue(del),
        }
        const service = new RoleService(db as never)

        await expect(service.assignRoleToUser('user-id', 'role-id')).resolves.toEqual({
            message: 'Role assigned to user',
        })
        expect(update.set).toHaveBeenCalledWith({ roleId: 'role-id' })

        await expect(service.assignRoleToUser('user-id', 'role-id')).resolves.toEqual({
            message: 'Role assigned to user',
        })
        expect(insert.values).toHaveBeenCalledWith({ userId: 'user-id', roleId: 'role-id' })

        await expect(service.removeRoleFromUser('user-id')).resolves.toEqual({
            message: 'Role removed from user',
        })
        expect(del.where).toHaveBeenCalled()
    })

    it('returns user roles and distinct user permissions', async () => {
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(createQuery([{ role: { id: 'role-id', name: 'admin' } }]))
                .mockReturnValueOnce(createQuery([{ roleId: 'role-id' }, { roleId: 'other-role' }]))
                .mockReturnValueOnce(
                    createQuery([
                        { name: 'users:read' },
                        { name: 'users:read' },
                        { name: 'users:write' },
                    ]),
                ),
        }
        const service = new RoleService(db as never)

        await expect(service.getUserRoles('user-id')).resolves.toEqual([
            { id: 'role-id', name: 'admin' },
        ])
        await expect(service.getUserPermissions('user-id')).resolves.toEqual([
            'users:read',
            'users:write',
        ])
    })

    it('returns no user permissions when the user has no roles', async () => {
        const db = { select: jest.fn().mockReturnValue(createQuery([])) }
        const service = new RoleService(db as never)

        await expect(service.getUserPermissions('user-id')).resolves.toEqual([])
        expect(db.select).toHaveBeenCalledTimes(1)
    })
})
