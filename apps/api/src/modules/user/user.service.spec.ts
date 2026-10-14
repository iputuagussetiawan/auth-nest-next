import * as bcrypt from 'bcrypt'

import { BadRequestException, NotFoundException } from '../../common/exceptions/app-error'
import { UserService } from './user.service'

jest.mock('bcrypt', () => ({ compare: jest.fn(), hash: jest.fn() }))

function query(result: unknown[]) {
    return {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
        offset: jest.fn().mockResolvedValue(result),
        then: jest.fn((resolve: (value: unknown[]) => unknown) => resolve(result)),
    }
}
function updateQuery(result: unknown[] = []) {
    return {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(result),
    }
}
function insertQuery(result: unknown[]) {
    return { values: jest.fn().mockReturnThis(), returning: jest.fn().mockResolvedValue(result) }
}

function service(db: Record<string, unknown>, overrides: Record<string, unknown> = {}) {
    return new UserService(
        db as never,
        (overrides.roleService ?? {
            getUserRoles: jest.fn().mockResolvedValue([]),
            getUserPermissions: jest.fn().mockResolvedValue([]),
            assignRoleToUser: jest.fn(),
        }) as never,
        (overrides.cloudinary ?? { upload: jest.fn(), delete: jest.fn() }) as never,
        (overrides.sessions ?? { getSessions: jest.fn().mockResolvedValue([]) }) as never,
    )
}

describe('UserService', () => {
    beforeEach(() => jest.clearAllMocks())

    it('aggregates the current user profile', async () => {
        const user = { id: 'user-id', email: 'a@example.com', firstName: 'A' }
        const roleService = {
            getUserRoles: jest.fn().mockResolvedValue([{ id: 'role-id', name: 'admin' }]),
            getUserPermissions: jest.fn().mockResolvedValue(['users:read']),
        }
        const sessions = { getSessions: jest.fn().mockResolvedValue([{ id: 'session-id' }]) }
        const result = await service(
            { select: jest.fn().mockReturnValue(query([user])) },
            { roleService, sessions },
        ).getMe('user-id', 'session-id')
        expect(result).toEqual({
            ...user,
            role: 'admin',
            roleId: 'role-id',
            permissions: ['users:read'],
            sessions: [{ id: 'session-id' }],
        })
    })

    it('updates profile and completes onboarding', async () => {
        const profile = { id: 'user-id', firstName: 'New' }
        const profileUpdate = updateQuery([profile])
        const onboardingUpdate = updateQuery([{ id: 'user-id', isOnboardingCompleted: true }])
        const db = {
            select: jest.fn().mockReturnValue(query([{ id: 'user-id' }])),
            update: jest
                .fn()
                .mockReturnValueOnce(profileUpdate)
                .mockReturnValueOnce(onboardingUpdate),
        }
        const instance = service(db)

        await expect(
            instance.updateProfile('user-id', { firstName: 'New' } as never),
        ).resolves.toEqual({ message: 'Profile updated', user: profile })
        await expect(instance.completeOnboarding('user-id')).resolves.toEqual({
            id: 'user-id',
            isOnboardingCompleted: true,
        })
    })

    it('rejects missing users', async () => {
        const instance = service({
            select: jest.fn().mockReturnValue(query([])),
            update: jest.fn().mockReturnValue(updateQuery([])),
        })
        await expect(instance.getMe('missing', 'session')).rejects.toBeInstanceOf(NotFoundException)
        await expect(instance.updateProfile('missing', {} as never)).rejects.toBeInstanceOf(
            NotFoundException,
        )
        await expect(instance.completeOnboarding('missing')).rejects.toBeInstanceOf(
            NotFoundException,
        )
    })

    it('updates avatar and removes an existing Cloudinary image', async () => {
        const cloudinary = {
            delete: jest.fn(),
            upload: jest.fn().mockResolvedValue({ secure_url: 'https://cdn.test/new.png' }),
        }
        const update = updateQuery([{ id: 'user-id', profilePicture: 'https://cdn.test/new.png' }])
        const db = {
            select: jest
                .fn()
                .mockReturnValue(
                    query([
                        { id: 'user-id', profilePicture: 'https://res.cloudinary.com/old.png' },
                    ]),
                ),
            update: jest.fn().mockReturnValue(update),
        }
        await expect(
            service(db, { cloudinary }).updateAvatar('user-id', {} as never),
        ).resolves.toEqual(expect.objectContaining({ message: 'Avatar updated' }))
        expect(cloudinary.delete).toHaveBeenCalledWith('https://res.cloudinary.com/old.png')
        expect(cloudinary.upload).toHaveBeenCalled()
    })

    it('creates, updates, deletes, and assigns admin users', async () => {
        const created = { id: 'user-id', email: 'new@example.com' }
        const insert = insertQuery([created])
        const update = updateQuery([created])
        const del = { where: jest.fn().mockResolvedValue(undefined) }
        const roleService = { assignRoleToUser: jest.fn() }
        const db = {
            select: jest
                .fn()
                .mockReturnValueOnce(query([]))
                .mockReturnValueOnce(query([{ id: 'user-id' }]))
                .mockReturnValueOnce(query([{ id: 'user-id' }])),
            insert: jest.fn().mockReturnValue(insert),
            update: jest.fn().mockReturnValue(update),
            delete: jest.fn().mockReturnValue(del),
        }
        ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
        const instance = service(db, { roleService })
        await expect(
            instance.adminCreateUser({
                email: 'new@example.com',
                password: 'Password123!',
                roleId: 'role-id',
            } as never),
        ).resolves.toEqual(created)
        expect(roleService.assignRoleToUser).toHaveBeenCalledWith('user-id', 'role-id')
        await expect(
            instance.adminUpdateUser('user-id', { firstName: 'Updated' } as never, 'admin-id'),
        ).resolves.toEqual(created)
        await expect(instance.adminDeleteUser('user-id', 'admin-id')).resolves.toEqual({
            message: 'User deleted',
        })
        await expect(
            instance.adminAssignRole('user-id', 'role-id', 'admin-id'),
        ).resolves.toBeUndefined()
    })

    it('stops admins from deleting, deactivating or demoting themselves', async () => {
        const db = { select: jest.fn(), update: jest.fn(), delete: jest.fn() }
        const roleService = { assignRoleToUser: jest.fn() }
        const instance = service(db, { roleService })

        await expect(instance.adminDeleteUser('admin-id', 'admin-id')).rejects.toBeInstanceOf(
            BadRequestException,
        )
        await expect(
            instance.adminUpdateUser('admin-id', { isActive: false } as never, 'admin-id'),
        ).rejects.toBeInstanceOf(BadRequestException)
        await expect(
            instance.adminAssignRole('admin-id', 'role-id', 'admin-id'),
        ).rejects.toBeInstanceOf(BadRequestException)
        expect(db.delete).not.toHaveBeenCalled()
        expect(db.update).not.toHaveBeenCalled()
        expect(roleService.assignRoleToUser).not.toHaveBeenCalled()
    })

    it('rejects duplicate admin users and validates password changes', async () => {
        const duplicate = service({
            select: jest.fn().mockReturnValue(query([{ id: 'existing' }])),
        })
        await expect(
            duplicate.adminCreateUser({
                email: 'a@example.com',
                password: 'Password123!',
            } as never),
        ).rejects.toBeInstanceOf(BadRequestException)

        const instance = service({
            select: jest
                .fn()
                .mockReturnValue(query([{ id: 'user-id', password: 'old', provider: 'email' }])),
            update: jest.fn().mockReturnValue(updateQuery()),
        })
        await expect(
            instance.updatePassword(
                'user-id',
                { currentPassword: 'a', newPassword: 'b', confirmPassword: 'c' } as never,
                'session-id',
            ),
        ).rejects.toBeInstanceOf(BadRequestException)
        ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
        await expect(
            instance.updatePassword(
                'user-id',
                { currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' } as never,
                'session-id',
            ),
        ).rejects.toBeInstanceOf(BadRequestException)
    })

    it('signs out other sessions after a password change', async () => {
        ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
        ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hash')
        const deleteWhere = jest.fn().mockResolvedValue(undefined)
        const db = {
            select: jest
                .fn()
                .mockReturnValue(query([{ id: 'user-id', password: 'old', provider: 'email' }])),
            update: jest.fn().mockReturnValue(updateQuery()),
            delete: jest.fn().mockReturnValue({ where: deleteWhere }),
        }
        await expect(
            service(db).updatePassword(
                'user-id',
                { currentPassword: 'a', newPassword: 'b', confirmPassword: 'b' } as never,
                'session-id',
            ),
        ).resolves.toEqual({ message: 'Password updated successfully' })
        expect(db.delete).toHaveBeenCalledTimes(1)
        expect(deleteWhere).toHaveBeenCalledTimes(1)
    })

    describe('getAllUsers', () => {
        function listDb(rows: unknown[], total: number) {
            const list = {
                from: jest.fn().mockReturnThis(),
                leftJoin: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                groupBy: jest.fn().mockReturnThis(),
                orderBy: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                offset: jest.fn().mockResolvedValue(rows),
            }
            const count = query([{ count: total }])
            const select = jest.fn().mockReturnValueOnce(list).mockReturnValueOnce(count)
            return { db: { select }, list, count }
        }

        it('caps limit and page, and groups rows per user', async () => {
            const { db, list } = listDb([{ id: 'u1' }], 1)
            const result = await service(db).getAllUsers(undefined, 0, 5000)
            expect(list.groupBy).toHaveBeenCalled()
            expect(list.limit).toHaveBeenCalledWith(100)
            expect(list.offset).toHaveBeenCalledWith(0)
            expect(result).toEqual({ data: [{ id: 'u1' }], total: 1, page: 1, limit: 100 })
        })

        it('applies the search filter to the total count too', async () => {
            const { db, list, count } = listDb([], 0)
            await service(db).getAllUsers('ann', 1, 20)
            expect(list.where.mock.calls[0][0]).toBeDefined()
            expect(count.where.mock.calls[0][0]).toBe(list.where.mock.calls[0][0])
        })
    })
})
