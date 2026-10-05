import { BadRequestException } from '@nestjs/common'

import { UserController } from './user.controller'

describe('UserController', () => {
    const service = {
        getMe: jest.fn(),
        updateProfile: jest.fn(),
        updatePassword: jest.fn(),
        completeOnboarding: jest.fn(),
        adminCreateUser: jest.fn(),
        getAllUsers: jest.fn(),
        adminUpdateUser: jest.fn(),
        adminDeleteUser: jest.fn(),
        adminAssignRole: jest.fn(),
        updateAvatar: jest.fn(),
    }
    const controller = new UserController(service as never)
    const req = { user: { userId: 'user-id', sessionId: 'session-id' } }

    beforeEach(() => jest.clearAllMocks())

    it('wraps self-service responses and forwards identity', async () => {
        service.getMe.mockResolvedValue({ id: 'user-id' })
        service.updateProfile.mockResolvedValue({
            message: 'Profile updated',
            user: { id: 'user-id' },
        })
        service.updatePassword.mockResolvedValue(undefined)
        service.completeOnboarding.mockResolvedValue(undefined)
        service.updateAvatar.mockResolvedValue({
            message: 'Avatar updated',
            user: { id: 'user-id' },
        })

        await expect(controller.getMe(req as never)).resolves.toEqual({
            status: 'success',
            message: 'User profile',
            data: { id: 'user-id' },
        })
        await expect(controller.updateProfile(req as never, {} as never)).resolves.toEqual({
            status: 'success',
            message: 'Profile updated',
            data: { id: 'user-id' },
        })
        await expect(controller.updatePassword(req as never, {} as never)).resolves.toEqual({
            status: 'success',
            message: 'Password updated successfully',
            data: null,
        })
        await expect(controller.completeOnboarding(req as never)).resolves.toEqual({
            status: 'success',
            message: 'Onboarding completed',
            data: null,
        })
        await expect(controller.updateAvatar(req as never, {} as never)).resolves.toEqual({
            status: 'success',
            message: 'Avatar updated',
            data: { id: 'user-id' },
        })
        expect(service.getMe).toHaveBeenCalledWith('user-id', 'session-id')
        expect(service.updateProfile).toHaveBeenCalledWith('user-id', {})
    })

    it('wraps admin operations', async () => {
        service.adminCreateUser.mockResolvedValue({ id: 'user-id' })
        service.getAllUsers.mockResolvedValue({ data: [], total: 0, page: 1, limit: 20 })
        service.adminUpdateUser.mockResolvedValue({ id: 'user-id' })
        service.adminDeleteUser.mockResolvedValue({ message: 'User deleted' })
        service.adminAssignRole.mockResolvedValue({ message: 'Role assigned' })

        await expect(controller.adminCreateUser({} as never)).resolves.toEqual({
            status: 'success',
            message: 'User created',
            data: { id: 'user-id' },
        })
        await expect(controller.adminGetUsers()).resolves.toEqual({
            status: 'success',
            message: 'Users fetched',
            data: { data: [], total: 0, page: 1, limit: 20 },
        })
        await expect(controller.adminUpdateUser('user-id', {} as never)).resolves.toEqual({
            status: 'success',
            message: 'User updated',
            data: { id: 'user-id' },
        })
        await expect(controller.adminDeleteUser('user-id')).resolves.toEqual({
            status: 'success',
            message: 'User deleted',
            data: null,
        })
        await expect(controller.adminAssignRole('user-id', { roleId: 'role-id' })).resolves.toEqual(
            { status: 'success', message: 'Role assigned', data: null },
        )
    })

    it('rejects avatar requests without a file', async () => {
        await expect(
            controller.updateAvatar(req as never, undefined as never),
        ).rejects.toBeInstanceOf(BadRequestException)
        expect(service.updateAvatar).not.toHaveBeenCalled()
    })
})
