import { BadRequestException, NotFoundException } from '../../../common/exceptions/app-error'
import { PermissionService } from './permission.service'

function createQuery(result: unknown[]) {
    return {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
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

describe('PermissionService', () => {
    it('lists permissions and finds a permission by ID', async () => {
        const permission = { id: 'permission-id', name: 'users:read' }
        const db = { select: jest.fn().mockReturnValueOnce(createQuery([permission])).mockReturnValueOnce(createQuery([permission])) }
        const service = new PermissionService(db as never)

        await expect(service.findAll()).resolves.toEqual([permission])
        await expect(service.findById('permission-id')).resolves.toEqual(permission)
    })

    it('throws when a permission ID does not exist', async () => {
        const db = { select: jest.fn().mockReturnValue(createQuery([])) }
        const service = new PermissionService(db as never)

        await expect(service.findById('missing-id')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('creates a permission and rejects duplicate names', async () => {
        const permission = { id: 'permission-id', name: 'users:read', description: 'Read users' }
        const insert = createInsertQuery([permission])
        const db = {
            select: jest.fn().mockReturnValue(createQuery([])),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new PermissionService(db as never)

        await expect(service.create({ name: 'users:read', description: 'Read users' })).resolves.toEqual(permission)
        expect(insert.values).toHaveBeenCalledWith({ name: 'users:read', description: 'Read users' })

        const duplicateDb = { select: jest.fn().mockReturnValue(createQuery([{ id: 'existing-id' }])) }
        await expect(new PermissionService(duplicateDb as never).create({ name: 'users:read' })).rejects.toBeInstanceOf(
            BadRequestException,
        )
    })

    it('updates a permission after checking that it exists', async () => {
        const permission = { id: 'permission-id', name: 'users:read' }
        const update = createUpdateQuery([{ ...permission, description: 'Updated' }])
        const db = {
            select: jest.fn().mockReturnValue(createQuery([permission])),
            update: jest.fn().mockReturnValue(update),
        }
        const service = new PermissionService(db as never)

        await expect(service.update('permission-id', { description: 'Updated' })).resolves.toEqual({
            id: 'permission-id',
            name: 'users:read',
            description: 'Updated',
        })
        expect(update.set).toHaveBeenCalledWith(expect.objectContaining({ description: 'Updated', updatedAt: expect.any(Date) }))
    })

    it('deletes a permission', async () => {
        const del = { where: jest.fn().mockResolvedValue(undefined) }
        const db = {
            select: jest.fn().mockReturnValue(createQuery([{ id: 'permission-id' }])),
            delete: jest.fn().mockReturnValue(del),
        }
        const service = new PermissionService(db as never)

        await expect(service.remove('permission-id')).resolves.toEqual({ message: 'Permission deleted' })
        expect(del.where).toHaveBeenCalled()
    })
})
