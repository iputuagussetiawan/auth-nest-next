import * as bcrypt from 'bcrypt'

import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '../../common/exceptions/app-error'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}))

function createSelectChain(result: unknown[]) {
    const chain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
        then: jest.fn((resolve: (value: unknown[]) => unknown) => resolve(result)),
    }
    return chain
}

function createInsertChain(returned: unknown[]) {
    const chain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(returned),
        onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
    }
    return chain
}

function createUpdateChain(returned: unknown[] = []) {
    const chain = {
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockResolvedValue(returned),
    }
    return chain
}

function createDeleteChain() {
    return { where: jest.fn().mockResolvedValue(undefined) }
}

function createService(
    db: Record<string, unknown>,
    overrides: {
        roleService?: Record<string, unknown>
        notificationService?: Record<string, unknown>
    } = {},
) {
    return new AuthService(
        db as never,
        { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() } as never,
        { sendVerificationEmail: jest.fn(), sendPasswordResetEmail: jest.fn() } as never,
        {
            findByName: jest.fn().mockResolvedValue({ id: 'role-id', name: 'user' }),
            assignRoleToUser: jest.fn(),
            ...(overrides.roleService ?? {}),
        } as never,
        {
            notifyNewUser: jest.fn().mockResolvedValue({}),
            ...(overrides.notificationService ?? {}),
        } as never,
    )
}

describe('AuthService', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('validateUser', () => {
        it('returns the user without password on valid credentials', async () => {
            const user = {
                id: 'user-id',
                email: 'a@example.com',
                password: 'hashed',
                isEmailVerified: true,
                isActive: true,
            }
            const db = { select: jest.fn().mockReturnValue(createSelectChain([user])) }
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
            const service = createService(db)

            const result = await service.validateUser('a@example.com', 'password')

            expect(result).toEqual({
                id: 'user-id',
                email: 'a@example.com',
                isEmailVerified: true,
                isActive: true,
            })
            expect(result).not.toHaveProperty('password')
        })

        it('returns null for unknown email', async () => {
            const db = { select: jest.fn().mockReturnValue(createSelectChain([])) }
            const service = createService(db)

            await expect(service.validateUser('a@example.com', 'password')).resolves.toBeNull()
        })

        it('returns null when the password does not match', async () => {
            const user = {
                id: 'user-id',
                password: 'hashed',
                isEmailVerified: true,
                isActive: true,
            }
            const db = { select: jest.fn().mockReturnValue(createSelectChain([user])) }
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
            const service = createService(db)

            await expect(service.validateUser('a@example.com', 'wrong')).resolves.toBeNull()
        })

        it('rejects unverified email', async () => {
            const user = {
                id: 'user-id',
                password: 'hashed',
                isEmailVerified: false,
                isActive: true,
            }
            const db = { select: jest.fn().mockReturnValue(createSelectChain([user])) }
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
            const service = createService(db)

            await expect(service.validateUser('a@example.com', 'password')).rejects.toBeInstanceOf(
                UnauthorizedException,
            )
        })

        it('rejects disabled accounts', async () => {
            const user = {
                id: 'user-id',
                password: 'hashed',
                isEmailVerified: true,
                isActive: false,
            }
            const db = { select: jest.fn().mockReturnValue(createSelectChain([user])) }
            ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
            const service = createService(db)

            await expect(service.validateUser('a@example.com', 'password')).rejects.toBeInstanceOf(
                UnauthorizedException,
            )
        })
    })

    describe('register', () => {
        const dto = {
            email: 'new@example.com',
            firstName: ' New ',
            lastName: 'User ',
            password: 'Password123!',
        }

        it('creates the user, verification code, role and notification', async () => {
            const created = { id: 'user-id', email: 'new@example.com', provider: 'email' }
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest
                    .fn()
                    .mockReturnValueOnce(createInsertChain([created]))
                    .mockReturnValueOnce(createInsertChain([{ id: 'code-id' }])),
            }
            const roleService = {
                findByName: jest.fn().mockResolvedValue({ id: 'role-id', name: 'user' }),
                assignRoleToUser: jest.fn(),
            }
            const notificationService = { notifyNewUser: jest.fn().mockResolvedValue({}) }
            const service = createService(db, { roleService, notificationService })

            await expect(service.register(dto as never)).resolves.toEqual({ userId: 'user-id' })
            expect(roleService.assignRoleToUser).toHaveBeenCalledWith('user-id', 'role-id')
            expect(notificationService.notifyNewUser).toHaveBeenCalledWith({
                id: 'user-id',
                email: 'new@example.com',
                provider: 'email',
            })
        })

        it('trims first and last name', async () => {
            const created = { id: 'user-id', email: 'new@example.com', provider: 'email' }
            const insert = createInsertChain([created])
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn().mockReturnValue(insert),
            }
            const service = createService(db)

            await service.register(dto as never)

            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({ firstName: 'New', lastName: 'User' }),
            )
        })

        it('rejects duplicate email', async () => {
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([{ id: 'existing-id' }])),
            }
            const service = createService(db)

            await expect(service.register(dto as never)).rejects.toBeInstanceOf(BadRequestException)
        })

        it('still registers when notification creation fails', async () => {
            const created = { id: 'user-id', email: 'new@example.com', provider: 'email' }
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest
                    .fn()
                    .mockReturnValueOnce(createInsertChain([created]))
                    .mockReturnValueOnce(createInsertChain([{ id: 'code-id' }])),
            }
            const notificationService = {
                notifyNewUser: jest.fn().mockRejectedValue(new Error('db down')),
            }
            const service = createService(db, { notificationService })
            const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)

            try {
                await expect(service.register(dto as never)).resolves.toEqual({ userId: 'user-id' })
            } finally {
                errorSpy.mockRestore()
            }
        })
    })

    describe('verifyEmail', () => {
        it('verifies the email and deletes the code', async () => {
            const record = { id: 'code-id', userId: 'user-id' }
            const update = createUpdateChain()
            const del = createDeleteChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([record])),
                update: jest.fn().mockReturnValue(update),
                delete: jest.fn().mockReturnValue(del),
            }
            const service = createService(db)

            await expect(service.verifyEmail('code')).resolves.toEqual({
                message: 'Email verified successfully',
            })
            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ isEmailVerified: true }),
            )
            expect(del.where).toHaveBeenCalled()
        })

        it('rejects an invalid or expired code', async () => {
            const db = { select: jest.fn().mockReturnValue(createSelectChain([])) }
            const service = createService(db)

            await expect(service.verifyEmail('bad')).rejects.toBeInstanceOf(BadRequestException)
        })
    })

    describe('loginOrCreateAccount', () => {
        it('creates a new Google user with verified email, role and notification', async () => {
            const created = { id: 'user-id', email: 'g@example.com', provider: 'google' }
            const insert = createInsertChain([created])
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn().mockReturnValue(insert),
            }
            const roleService = {
                findByName: jest.fn().mockResolvedValue({ id: 'role-id', name: 'user' }),
                assignRoleToUser: jest.fn(),
            }
            const notificationService = { notifyNewUser: jest.fn().mockResolvedValue({}) }
            const service = createService(db, { roleService, notificationService })

            const result = await service.loginOrCreateAccount({
                provider: 'google',
                providerId: 'google-id',
                firstName: 'Grace',
                lastName: 'Google',
                email: 'g@example.com',
            })

            expect(result).toEqual(created)
            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({ isEmailVerified: true }),
            )
            expect(roleService.assignRoleToUser).toHaveBeenCalledWith('user-id', 'role-id')
            expect(notificationService.notifyNewUser).toHaveBeenCalled()
        })

        it('updates lastLogin for an existing user without creating a notification', async () => {
            const existing = { id: 'user-id', email: 'g@example.com', provider: 'google' }
            const update = createUpdateChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([existing])),
                update: jest.fn().mockReturnValue(update),
            }
            const notificationService = { notifyNewUser: jest.fn() }
            const service = createService(db, { notificationService })

            const result = await service.loginOrCreateAccount({
                provider: 'google',
                providerId: 'google-id',
                firstName: 'Grace',
                lastName: 'Google',
                email: 'g@example.com',
            })

            expect(result).toEqual(existing)
            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ lastLogin: expect.any(Date) }),
            )
            expect(notificationService.notifyNewUser).not.toHaveBeenCalled()
        })
    })

    describe('forgotPassword', () => {
        it('responds identically for unknown email (no enumeration)', async () => {
            const db = { select: jest.fn().mockReturnValue(createSelectChain([])) }
            const service = createService(db)

            await expect(service.forgotPassword('ghost@example.com')).resolves.toEqual({
                message: 'Password reset email sent',
            })
        })

        it('rate-limits after two recent reset codes', async () => {
            const user = { id: 'user-id', email: 'a@example.com' }
            const first = createSelectChain([user])
            const second = createSelectChain([{ recentCount: 2 }])
            const db = { select: jest.fn().mockReturnValueOnce(first).mockReturnValueOnce(second) }
            const service = createService(db)

            await expect(service.forgotPassword('a@example.com')).rejects.toBeInstanceOf(Error)
        })

        it('stores a reset code and sends the email', async () => {
            const user = { id: 'user-id', email: 'a@example.com' }
            const db = {
                select: jest
                    .fn()
                    .mockReturnValueOnce(createSelectChain([user]))
                    .mockReturnValueOnce(createSelectChain([{ recentCount: 0 }])),
                insert: jest.fn().mockReturnValue(createInsertChain([{ id: 'code-id' }])),
            }
            const service = createService(db)

            await expect(service.forgotPassword('a@example.com')).resolves.toEqual({
                message: 'Password reset email sent',
            })
            expect(db.insert).toHaveBeenCalled()
        })
    })

    describe('resetPassword', () => {
        it('resets the password and deletes the code', async () => {
            const record = { id: 'code-id', userId: 'user-id' }
            const update = createUpdateChain()
            const del = createDeleteChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([record])),
                update: jest.fn().mockReturnValue(update),
                delete: jest.fn().mockReturnValue(del),
            }
            ;(bcrypt.hash as jest.Mock).mockResolvedValue('new-hash')
            const service = createService(db)

            await expect(
                service.resetPassword({
                    verificationCode: 'code',
                    password: 'NewPass123!',
                } as never),
            ).resolves.toEqual({ message: 'Password reset successfully' })
            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'new-hash' }),
            )
            // Password reset must revoke every existing session for that user
            expect(db.delete).toHaveBeenCalledTimes(2)
        })

        it('rejects an invalid or expired code', async () => {
            const db = { select: jest.fn().mockReturnValue(createSelectChain([])) }
            const service = createService(db)

            await expect(
                service.resetPassword({
                    verificationCode: 'bad',
                    password: 'NewPass123!',
                } as never),
            ).rejects.toBeInstanceOf(NotFoundException)
        })
    })

    describe('refreshToken', () => {
        function createTokenService(verifyResult: unknown) {
            return {
                sign: jest.fn().mockReturnValue('token'),
                verify: jest.fn().mockReturnValue(verifyResult),
            }
        }

        it('rotates tokens for a valid session', async () => {
            const session = {
                id: 'session-id',
                userId: 'user-id',
                expiredAt: new Date(Date.now() + 60_000),
            }
            const update = createUpdateChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([session])),
                update: jest.fn().mockReturnValue(update),
            }
            const jwt = createTokenService({ sessionId: 'session-id' })
            const service = new AuthService(
                db as never,
                jwt as never,
                {} as never,
                {} as never,
                {} as never,
            )

            const result = await service.refreshToken('refresh-token')

            expect(result).toEqual({ access_token: 'token', refresh_token: 'token' })
            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ expiredAt: expect.any(Date) }),
            )
        })

        it('rejects an invalid refresh token', async () => {
            const jwt = {
                sign: jest.fn(),
                verify: jest.fn().mockImplementation(() => {
                    throw new Error('bad')
                }),
            }
            const service = new AuthService(
                {} as never,
                jwt as never,
                {} as never,
                {} as never,
                {} as never,
            )

            await expect(service.refreshToken('bad')).rejects.toBeInstanceOf(UnauthorizedException)
        })

        it('rejects an expired session', async () => {
            const session = {
                id: 'session-id',
                userId: 'user-id',
                expiredAt: new Date(Date.now() - 60_000),
            }
            const db = { select: jest.fn().mockReturnValue(createSelectChain([session])) }
            const jwt = createTokenService({ sessionId: 'session-id' })
            const service = new AuthService(
                db as never,
                jwt as never,
                {} as never,
                {} as never,
                {} as never,
            )

            await expect(service.refreshToken('refresh-token')).rejects.toBeInstanceOf(
                UnauthorizedException,
            )
        })
    })
})
