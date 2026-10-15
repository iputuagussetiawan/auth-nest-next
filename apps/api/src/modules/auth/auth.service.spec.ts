import * as crypto from 'crypto'
import * as bcrypt from 'bcrypt'

import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
} from '../../common/exceptions/app-error'
import { sessions } from '../../database/schema/auth/sessions.schema'
import { verificationCodes } from '../../database/schema/auth/verification-codes.schema'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}))

function createSelectChain(result: unknown[]) {
    const chain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
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

const GOOGLE_PHOTO = 'https://lh3.googleusercontent.com/a/photo=s96-c'
const CLOUDINARY_URL = 'https://res.cloudinary.com/demo/image/upload/v1/profile-pictures/photo.jpg'

function createService(
    db: Record<string, unknown>,
    overrides: {
        roleService?: Record<string, unknown>
        notificationService?: Record<string, unknown>
        cloudinaryService?: Record<string, unknown>
        maintenanceMode?: boolean
    } = {},
) {
    return new AuthService(
        db as never,
        { sign: jest.fn().mockReturnValue('signed-token'), verify: jest.fn() } as never,
        {
            sendVerificationEmail: jest.fn(),
            sendPasswordResetEmail: jest.fn(),
            sendAccountExistsEmail: jest.fn(),
        } as never,
        {
            findByName: jest.fn().mockResolvedValue({ id: 'role-id', name: 'user' }),
            assignRoleToUser: jest.fn(),
            ...(overrides.roleService ?? {}),
        } as never,
        {
            notifyNewUser: jest.fn().mockResolvedValue({}),
            ...(overrides.notificationService ?? {}),
        } as never,
        {
            get: jest
                .fn()
                .mockResolvedValue({ maintenanceMode: overrides.maintenanceMode ?? false }),
        } as never,
        {
            uploadFromUrl: jest.fn().mockResolvedValue({ secure_url: CLOUDINARY_URL }),
            ...(overrides.cloudinaryService ?? {}),
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
            // Still pays for a bcrypt compare so unknown emails can't be told apart by timing
            expect(bcrypt.compare).toHaveBeenCalledWith(
                'password',
                expect.stringMatching(/^\$2b\$10\$/),
            )
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

            await expect(service.register(dto as never)).resolves.toBeUndefined()
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

        describe('when the email already has an account', () => {
            const existing = { id: 'existing-id', email: 'new@example.com' }

            it('answers like a new sign-up and emails the owner a sign-in and reset link', async () => {
                const insert = createInsertChain([{ id: 'code-id' }])
                const db = {
                    select: jest
                        .fn()
                        .mockReturnValueOnce(createSelectChain([existing]))
                        .mockReturnValueOnce(createSelectChain([{ recentCount: 0 }])),
                    insert: jest.fn().mockReturnValue(insert),
                }
                const mailService = { sendAccountExistsEmail: jest.fn() }
                const service = createService(db)
                ;(service as any).mailService = mailService

                await expect(service.register(dto as never)).resolves.toBeUndefined()

                // Only a reset code is stored: no second user, no verification code
                expect(db.insert).toHaveBeenCalledTimes(1)
                expect(db.insert).toHaveBeenCalledWith(verificationCodes)
                expect(insert.values).toHaveBeenCalledWith(
                    expect.objectContaining({ userId: 'existing-id', type: 'password_reset' }),
                )
                const [to, signinUrl, resetUrl] = mailService.sendAccountExistsEmail.mock.calls[0]
                expect(to).toBe('new@example.com')
                expect(signinUrl).toMatch(/\/signin$/)
                expect(resetUrl).toMatch(/\/reset-password\?code=[0-9a-f]+&exp=\d+$/)
                // Same work as a real sign-up, so timing doesn't tell the two apart
                expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 10)
            })

            it('stays silent instead of erroring when reset emails were just sent', async () => {
                const db = {
                    select: jest
                        .fn()
                        .mockReturnValueOnce(createSelectChain([existing]))
                        .mockReturnValueOnce(createSelectChain([{ recentCount: 2 }])),
                    insert: jest.fn(),
                }
                const mailService = { sendAccountExistsEmail: jest.fn() }
                const service = createService(db)
                ;(service as any).mailService = mailService

                await expect(service.register(dto as never)).resolves.toBeUndefined()
                expect(db.insert).not.toHaveBeenCalled()
                expect(mailService.sendAccountExistsEmail).not.toHaveBeenCalled()
            })
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
                await expect(service.register(dto as never)).resolves.toBeUndefined()
            } finally {
                errorSpy.mockRestore()
            }
        })
    })

    describe('maintenance mode', () => {
        it('rejects new registrations', async () => {
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn(),
            }
            await expect(
                createService(db, { maintenanceMode: true }).register({
                    firstName: 'A',
                    lastName: 'B',
                    email: 'new@example.com',
                    password: 'Password123!',
                }),
            ).rejects.toMatchObject({ status: 503 })
            expect(db.insert).not.toHaveBeenCalled()
        })

        it('rejects new Google accounts but lets existing ones sign in', async () => {
            const blocked = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn(),
            }
            await expect(
                createService(blocked, { maintenanceMode: true }).loginOrCreateAccount({
                    provider: 'google',
                    providerId: 'g-1',
                    firstName: 'A',
                    lastName: 'B',
                    email: 'new@example.com',
                }),
            ).rejects.toMatchObject({ status: 503 })
            expect(blocked.insert).not.toHaveBeenCalled()

            const existing = { id: 'user-id', email: 'old@example.com', isEmailVerified: true }
            const allowed = {
                select: jest.fn().mockReturnValue(createSelectChain([existing])),
                update: jest.fn().mockReturnValue(createUpdateChain()),
            }
            await expect(
                createService(allowed, { maintenanceMode: true }).loginOrCreateAccount({
                    provider: 'google',
                    providerId: 'g-2',
                    firstName: 'A',
                    lastName: 'B',
                    email: 'old@example.com',
                }),
            ).resolves.toEqual(existing)
        })
    })

    describe('mobile Google sign-in codes', () => {
        const sha = (v: string) => crypto.createHash('sha256').update(v).digest('hex')
        const verifier = 'b'.repeat(64)

        it('stores the code bound to the challenge, never as-is', async () => {
            const insert = createInsertChain([])
            const service = createService({ insert: jest.fn().mockReturnValue(insert) })

            const code = await service.createMobileExchangeCode('user-id', sha(verifier))

            expect(code).toMatch(/^[0-9a-f]{64}$/)
            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user-id',
                    code: sha(`${code}:${sha(verifier)}`),
                    type: 'mobile_oauth',
                }),
            )
        })

        function redeemDb(record: unknown, user: unknown) {
            const del = {
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue(record ? [record] : []),
            }
            return {
                db: {
                    delete: jest.fn().mockReturnValue(del),
                    select: jest.fn().mockReturnValue(createSelectChain(user ? [user] : [])),
                },
                del,
            }
        }

        it('returns the user and deletes the code in the same statement', async () => {
            const user = { id: 'user-id', isActive: true }
            const { db, del } = redeemDb({ userId: 'user-id' }, user)

            await expect(
                createService(db).redeemMobileExchangeCode('c'.repeat(64), verifier),
            ).resolves.toEqual(user)
            expect(db.delete).toHaveBeenCalledWith(verificationCodes)
            expect(del.returning).toHaveBeenCalled()
        })

        it('rejects a code without the matching verifier, or used twice', async () => {
            const { db } = redeemDb(null, null)
            await expect(
                createService(db).redeemMobileExchangeCode('c'.repeat(64), verifier),
            ).rejects.toBeInstanceOf(UnauthorizedException)
            expect(db.select).not.toHaveBeenCalled()
        })

        it('rejects a disabled account', async () => {
            const { db } = redeemDb({ userId: 'user-id' }, { id: 'user-id', isActive: false })
            await expect(
                createService(db).redeemMobileExchangeCode('c'.repeat(64), verifier),
            ).rejects.toBeInstanceOf(UnauthorizedException)
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
        const googleProfile = {
            provider: 'google',
            providerId: 'google-id',
            firstName: 'Grace',
            lastName: 'Google',
            email: 'g@example.com',
        }

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
            const existing = {
                id: 'user-id',
                email: 'g@example.com',
                provider: 'google',
                isEmailVerified: true,
            }
            const update = createUpdateChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([existing])),
                update: jest.fn().mockReturnValue(update),
                delete: jest.fn(),
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
            expect(update.set.mock.calls[0][0]).not.toHaveProperty('password')
            expect(db.delete).not.toHaveBeenCalled()
            expect(notificationService.notifyNewUser).not.toHaveBeenCalled()
        })

        it('takes over an unverified email signup: drops its password, sessions and codes', async () => {
            // Someone registered this address with a password but never verified it
            const squatted = {
                id: 'user-id',
                email: 'g@example.com',
                provider: 'email',
                password: 'attacker-hash',
                isEmailVerified: false,
            }
            const update = createUpdateChain()
            const deleteChain = createDeleteChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([squatted])),
                update: jest.fn().mockReturnValue(update),
                delete: jest.fn().mockReturnValue(deleteChain),
            }

            await createService(db).loginOrCreateAccount(googleProfile)

            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({
                    isEmailVerified: true,
                    password: null,
                    provider: 'google',
                    providerId: 'google-id',
                }),
            )
            // Sessions and pending verification/reset codes
            expect(db.delete).toHaveBeenCalledTimes(2)
            expect(deleteChain.where).toHaveBeenCalledTimes(2)
        })

        it('copies a new Google user photo into Cloudinary at a larger size', async () => {
            const insert = createInsertChain([{ id: 'user-id', email: 'g@example.com' }])
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn().mockReturnValue(insert),
            }
            const cloudinaryService = {
                uploadFromUrl: jest.fn().mockResolvedValue({ secure_url: CLOUDINARY_URL }),
            }
            const service = createService(db, { cloudinaryService })

            await service.loginOrCreateAccount({ ...googleProfile, picture: GOOGLE_PHOTO })

            expect(cloudinaryService.uploadFromUrl).toHaveBeenCalledWith(
                'https://lh3.googleusercontent.com/a/photo=s256-c',
            )
            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({ profilePicture: CLOUDINARY_URL }),
            )
        })

        it('keeps the Google URL when the Cloudinary upload fails', async () => {
            jest.spyOn(console, 'error').mockImplementation(() => {})
            const insert = createInsertChain([{ id: 'user-id', email: 'g@example.com' }])
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([])),
                insert: jest.fn().mockReturnValue(insert),
            }
            const cloudinaryService = { uploadFromUrl: jest.fn().mockRejectedValue(new Error()) }
            const service = createService(db, { cloudinaryService })

            await expect(
                service.loginOrCreateAccount({ ...googleProfile, picture: GOOGLE_PHOTO }),
            ).resolves.toBeDefined()
            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({ profilePicture: GOOGLE_PHOTO }),
            )
        })

        it('moves an existing user still on a Google photo URL to Cloudinary', async () => {
            const existing = {
                id: 'user-id',
                email: 'g@example.com',
                profilePicture: GOOGLE_PHOTO,
                isEmailVerified: true,
            }
            const update = createUpdateChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([existing])),
                update: jest.fn().mockReturnValue(update),
            }
            const service = createService(db)

            const result = await service.loginOrCreateAccount({
                ...googleProfile,
                picture: GOOGLE_PHOTO,
            })

            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ profilePicture: CLOUDINARY_URL }),
            )
            expect(result.profilePicture).toBe(CLOUDINARY_URL)
        })

        it('leaves an existing Cloudinary photo untouched', async () => {
            const existing = {
                id: 'user-id',
                email: 'g@example.com',
                profilePicture: CLOUDINARY_URL,
                isEmailVerified: true,
            }
            const update = createUpdateChain()
            const db = {
                select: jest.fn().mockReturnValue(createSelectChain([existing])),
                update: jest.fn().mockReturnValue(update),
            }
            const cloudinaryService = { uploadFromUrl: jest.fn() }
            const service = createService(db, { cloudinaryService })

            await service.loginOrCreateAccount({ ...googleProfile, picture: GOOGLE_PHOTO })

            expect(cloudinaryService.uploadFromUrl).not.toHaveBeenCalled()
            expect(update.set).toHaveBeenCalledWith(
                expect.not.objectContaining({ profilePicture: expect.anything() }),
            )
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
            const insert = createInsertChain([{ id: 'code-id' }])
            const db = {
                select: jest
                    .fn()
                    .mockReturnValueOnce(createSelectChain([user]))
                    .mockReturnValueOnce(createSelectChain([{ recentCount: 0 }])),
                insert: jest.fn().mockReturnValue(insert),
            }
            const mailService = { sendPasswordResetEmail: jest.fn() }
            const service = createService(db)
            ;(service as any).mailService = mailService

            await expect(service.forgotPassword('a@example.com')).resolves.toEqual({
                message: 'Password reset email sent',
            })
            // The emailed code is never stored as-is, only its SHA-256
            const resetUrl: string = mailService.sendPasswordResetEmail.mock.calls[0][1]
            const code = resetUrl.match(/code=([0-9a-f]+)/)![1]
            expect(insert.values).toHaveBeenCalledWith(
                expect.objectContaining({
                    code: crypto.createHash('sha256').update(code).digest('hex'),
                }),
            )
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
            // The emailed link proves the address, so it also counts as verifying it
            expect(update.set).toHaveBeenCalledWith(
                expect.objectContaining({ password: 'new-hash', isEmailVerified: true }),
            )
            // Password reset must revoke every session and every outstanding reset code for that user
            expect(db.delete).toHaveBeenCalledTimes(2)
            expect(db.delete).toHaveBeenCalledWith(sessions)
            expect(db.delete).toHaveBeenCalledWith(verificationCodes)
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
        const future = () => new Date(Date.now() + 60_000)

        function setup(
            rows: Record<string, unknown>[],
            rotatedRows: unknown[] = [{ id: 'session-id' }],
        ) {
            const select = jest.fn()
            // Each row is joined with its user; isActive defaults to an active account
            rows.forEach(({ isActive = true, ...session }) =>
                select.mockReturnValueOnce(createSelectChain([{ session, isActive }])),
            )
            const update = {
                set: jest.fn().mockReturnThis(),
                where: jest.fn().mockReturnThis(),
                returning: jest.fn().mockResolvedValue(rotatedRows),
            }
            const deleteChain = createDeleteChain()
            const db = {
                select,
                update: jest.fn().mockReturnValue(update),
                delete: jest.fn().mockReturnValue(deleteChain),
            }
            const jwt = {
                sign: jest.fn((p: Record<string, unknown>) => `signed:${p.tokenId ?? 'access'}`),
                verify: jest.fn(),
            }
            const service = new AuthService(
                db as never,
                jwt as never,
                {} as never,
                {} as never,
                {} as never,
                {} as never,
                {} as never,
            )
            const refresh = (payload: Record<string, unknown>) => {
                jwt.verify.mockReturnValue({ sessionId: 'session-id', ...payload })
                return service.refreshToken('refresh-token')
            }
            return { db, update, refresh }
        }

        it('rotates the current refresh token', async () => {
            const { update, refresh } = setup([
                { id: 'session-id', userId: 'user-id', expiredAt: future(), refreshTokenId: 't1' },
            ])

            const result = await refresh({ tokenId: 't1' })

            const { refreshTokenId, previousRefreshTokenId } = update.set.mock.calls[0][0]
            expect(previousRefreshTokenId).toBe('t1')
            expect(refreshTokenId).not.toBe('t1')
            expect(result).toEqual({
                access_token: 'signed:access',
                refresh_token: `signed:${refreshTokenId}`,
            })
        })

        it('refuses to refresh for a disabled account', async () => {
            const { update, refresh } = setup([
                {
                    id: 'session-id',
                    userId: 'user-id',
                    expiredAt: future(),
                    refreshTokenId: 't1',
                    isActive: false,
                },
            ])
            await expect(refresh({ tokenId: 't1' })).rejects.toBeInstanceOf(UnauthorizedException)
            expect(update.set).not.toHaveBeenCalled()
        })

        it('upgrades a session created before rotation existed', async () => {
            const { update, refresh } = setup([
                { id: 'session-id', userId: 'user-id', expiredAt: future(), refreshTokenId: null },
            ])
            await expect(refresh({})).resolves.toHaveProperty('refresh_token')
            expect(update.set.mock.calls[0][0].previousRefreshTokenId).toBeNull()
        })

        it('lets a parallel request that just lost the rotation reuse the previous token', async () => {
            const { db, refresh } = setup([
                {
                    id: 'session-id',
                    userId: 'user-id',
                    expiredAt: future(),
                    refreshTokenId: 't2',
                    previousRefreshTokenId: 't1',
                    refreshRotatedAt: new Date(),
                },
            ])
            await expect(refresh({ tokenId: 't1' })).resolves.toEqual({
                access_token: 'signed:access',
                refresh_token: 'signed:t2',
            })
            expect(db.update).not.toHaveBeenCalled()
            expect(db.delete).not.toHaveBeenCalled()
        })

        it('falls back to the latest row when a concurrent refresh rotated first', async () => {
            const { db, refresh } = setup(
                [
                    {
                        id: 'session-id',
                        userId: 'user-id',
                        expiredAt: future(),
                        refreshTokenId: 't1',
                    },
                    {
                        id: 'session-id',
                        userId: 'user-id',
                        expiredAt: future(),
                        refreshTokenId: 't2',
                        previousRefreshTokenId: 't1',
                        refreshRotatedAt: new Date(),
                    },
                ],
                [],
            )
            await expect(refresh({ tokenId: 't1' })).resolves.toHaveProperty(
                'refresh_token',
                'signed:t2',
            )
            expect(db.delete).not.toHaveBeenCalled()
        })

        it('revokes the session when an old refresh token is replayed', async () => {
            const { db, refresh } = setup([
                {
                    id: 'session-id',
                    userId: 'user-id',
                    expiredAt: future(),
                    refreshTokenId: 't3',
                    previousRefreshTokenId: 't2',
                    refreshRotatedAt: new Date(),
                },
            ])
            await expect(refresh({ tokenId: 't1' })).rejects.toBeInstanceOf(UnauthorizedException)
            expect(db.delete).toHaveBeenCalledTimes(1)
        })

        it('revokes the session when the previous token comes back after the grace window', async () => {
            const { db, refresh } = setup([
                {
                    id: 'session-id',
                    userId: 'user-id',
                    expiredAt: future(),
                    refreshTokenId: 't2',
                    previousRefreshTokenId: 't1',
                    refreshRotatedAt: new Date(Date.now() - 60_000),
                },
            ])
            await expect(refresh({ tokenId: 't1' })).rejects.toBeInstanceOf(UnauthorizedException)
            expect(db.delete).toHaveBeenCalledTimes(1)
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
                {} as never,
                {} as never,
            )

            await expect(service.refreshToken('bad')).rejects.toBeInstanceOf(UnauthorizedException)
        })

        it('rejects an expired session', async () => {
            const { db, refresh } = setup([
                {
                    id: 'session-id',
                    userId: 'user-id',
                    expiredAt: new Date(Date.now() - 60_000),
                    refreshTokenId: 't1',
                },
            ])
            await expect(refresh({ tokenId: 't1' })).rejects.toBeInstanceOf(UnauthorizedException)
            expect(db.update).not.toHaveBeenCalled()
        })
    })

    describe('createSession', () => {
        it("inserts a new session, replacing this device's old one and pruning expired ones", async () => {
            const session = { id: 'session-id', userId: 'user-id' }
            const deleteChain = createDeleteChain()
            const insertChain = createInsertChain([session])
            const db = {
                delete: jest.fn().mockReturnValue(deleteChain),
                insert: jest.fn().mockReturnValue(insertChain),
                select: jest.fn(),
            }

            await expect(
                createService(db).createSession('user-id', 'Chrome', '1.2.3.4', 'device-id'),
            ).resolves.toEqual(session)
            expect(insertChain.values.mock.calls[0][0].refreshTokenId).toEqual(expect.any(String))
            expect(db.select).not.toHaveBeenCalled()
            expect(deleteChain.where).toHaveBeenCalledTimes(1)
            expect(insertChain.values).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId: 'user-id',
                    deviceId: 'device-id',
                    userAgent: 'Chrome',
                }),
            )
        })
    })
})
