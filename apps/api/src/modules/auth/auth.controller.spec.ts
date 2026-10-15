import * as crypto from 'crypto'

import { BadRequestException } from '../../common/exceptions/app-error'
import { AuthController } from './auth.controller'
import { MOBILE_OAUTH_COOKIE } from './google-mobile'

function createResponse() {
    return {
        cookie: jest.fn(),
        clearCookie: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    }
}

describe('AuthController security behavior', () => {
    it('sets matching secure cookie options when refreshing tokens', async () => {
        const authService = {
            refreshToken: jest.fn().mockResolvedValue({
                access_token: 'access-token',
                refresh_token: 'refresh-token',
            }),
        }
        const controller = new AuthController(authService as never)
        const response = createResponse()

        await controller.refresh(
            { cookies: { refreshToken: 'old-token' } } as never,
            response as never,
        )

        expect(response.cookie).toHaveBeenNthCalledWith(
            1,
            'accessToken',
            'access-token',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
            }),
        )
        expect(response.cookie).toHaveBeenNthCalledWith(
            2,
            'refreshToken',
            'refresh-token',
            expect.objectContaining({
                httpOnly: true,
                sameSite: 'strict',
                path: '/',
            }),
        )
    })

    it('clears both cookies after password reset', async () => {
        const authService = { resetPassword: jest.fn().mockResolvedValue(undefined) }
        const controller = new AuthController(authService as never)
        const response = createResponse()

        await controller.resetPassword(
            { verificationCode: 'code', password: 'Password123!' } as never,
            response as never,
        )

        expect(response.clearCookie).toHaveBeenNthCalledWith(
            1,
            'accessToken',
            expect.objectContaining({ path: '/', httpOnly: true }),
        )
        expect(response.clearCookie).toHaveBeenNthCalledWith(
            2,
            'refreshToken',
            expect.objectContaining({ path: '/', httpOnly: true }),
        )
    })

    it('revokes the session and clears both cookies on logout', async () => {
        const authService = { deleteSession: jest.fn().mockResolvedValue(undefined) }
        const controller = new AuthController(authService as never)
        const response = createResponse()

        await controller.logout({ user: { sessionId: 'session-id' } } as never, response as never)

        expect(authService.deleteSession).toHaveBeenCalledWith('session-id')
        expect(response.clearCookie).toHaveBeenCalledTimes(2)
    })

    describe('googleCallback', () => {
        function callback(req: Record<string, unknown>) {
            const authService = {
                createSession: jest.fn().mockResolvedValue({ id: 's1', refreshTokenId: 't1' }),
                signAccessToken: jest.fn().mockReturnValue('access'),
                signRefreshToken: jest.fn().mockReturnValue('refresh'),
            }
            const response = { ...createResponse(), redirect: jest.fn() }
            const request = { headers: {}, socket: {}, ...req }
            return new AuthController(authService as never)
                .googleCallback(request as never, response as never)
                .then(() => ({ response, authService }))
        }

        it('sends a failed Google sign-in back to /signin with the reason', async () => {
            const { response, authService } = await callback({ googleAuthError: 'signup_closed' })
            expect(response.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/\/signin\?status=signup_closed$/),
            )
            expect(authService.createSession).not.toHaveBeenCalled()
        })

        it('does not create a session for a disabled account', async () => {
            const { response, authService } = await callback({
                user: { id: 'u1', isActive: false },
            })
            expect(response.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/\/signin\?status=account_disabled$/),
            )
            expect(authService.createSession).not.toHaveBeenCalled()
            expect(response.cookie).not.toHaveBeenCalled()
        })

        it('signs in an active user and redirects to the dashboard', async () => {
            const { response } = await callback({
                user: { id: 'u1', isActive: true, isOnboardingCompleted: true },
            })
            expect(response.cookie).toHaveBeenCalledTimes(3)
            expect(response.redirect).toHaveBeenCalledWith(
                expect.stringMatching(/\/auth\/complete\?next=\/dashboard$/),
            )
        })

        it("reuses the browser's device id so its previous session is replaced", async () => {
            const deviceId = '11111111-2222-4333-8444-555555555555'
            const { response, authService } = await callback({
                user: { id: 'u1', isActive: true, isOnboardingCompleted: true },
                cookies: { deviceId },
            })
            expect(authService.createSession).toHaveBeenCalledWith(
                'u1',
                undefined,
                undefined,
                deviceId,
            )
            expect(response.cookie).toHaveBeenCalledWith(
                'deviceId',
                deviceId,
                expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
            )
        })

        it('issues a fresh device id when the cookie is missing or malformed', async () => {
            const { authService } = await callback({
                user: { id: 'u1', isActive: true, isOnboardingCompleted: true },
                cookies: { deviceId: 'not-a-uuid' },
            })
            const deviceId = authService.createSession.mock.calls[0][3]
            expect(deviceId).toMatch(/^[0-9a-f-]{36}$/)
            expect(deviceId).not.toBe('not-a-uuid')
        })
    })

    describe('mobile Google sign-in', () => {
        const challenge = 'a'.repeat(64)
        const mobileCookie = {
            [MOBILE_OAUTH_COOKIE]: JSON.stringify({
                redirectUri: 'myauthmobile://auth/google',
                challenge,
            }),
        }

        function callback(req: Record<string, unknown>) {
            const authService = {
                createSession: jest.fn(),
                createMobileExchangeCode: jest.fn().mockResolvedValue('one-time-code'),
            }
            const response = { ...createResponse(), redirect: jest.fn() }
            const request = { headers: {}, socket: {}, ...req }
            return new AuthController(authService as never)
                .googleCallback(request as never, response as never)
                .then(() => ({ response, authService }))
        }

        it('start returns a browser URL whose challenge is the hash of the verifier', () => {
            const saved = process.env.GOOGLE_CALLBACK_URL
            process.env.GOOGLE_CALLBACK_URL = 'https://web.example.com/api/auth/google/callback'
            try {
                const result = new AuthController({} as never).mobileGoogleStart({
                    redirectUri: 'myauthmobile://auth/google',
                })
                const { url, verifier } = result.data as { url: string; verifier: string }
                expect(verifier).toMatch(/^[0-9a-f]{64}$/)
                expect(new URL(url).searchParams.get('challenge')).toBe(
                    crypto.createHash('sha256').update(verifier).digest('hex'),
                )
            } finally {
                process.env.GOOGLE_CALLBACK_URL = saved
            }
        })

        it('start refuses a redirect that is not an app link', () => {
            expect(() =>
                new AuthController({} as never).mobileGoogleStart({
                    redirectUri: 'https://evil.example.com',
                }),
            ).toThrow(BadRequestException)
        })

        it('callback sends the app a one-time code instead of setting cookies', async () => {
            const { response, authService } = await callback({
                user: { id: 'u1', isActive: true },
                cookies: mobileCookie,
            })
            expect(authService.createMobileExchangeCode).toHaveBeenCalledWith('u1', challenge)
            expect(authService.createSession).not.toHaveBeenCalled()
            expect(response.cookie).not.toHaveBeenCalled()
            expect(response.redirect).toHaveBeenCalledWith(
                'myauthmobile://auth/google?code=one-time-code',
            )
        })

        it('callback sends a failure back to the app', async () => {
            const { response, authService } = await callback({
                googleAuthError: 'email_unverified',
                cookies: mobileCookie,
            })
            expect(response.redirect).toHaveBeenCalledWith(
                'myauthmobile://auth/google?error=email_unverified',
            )
            expect(authService.createMobileExchangeCode).not.toHaveBeenCalled()
        })

        it('exchange signs in like a password login', async () => {
            const user = { id: 'u1', email: 'a@example.com', isActive: true }
            const authService = {
                redeemMobileExchangeCode: jest.fn().mockResolvedValue(user),
                createSession: jest.fn().mockResolvedValue({ id: 's1', refreshTokenId: 't1' }),
                signAccessToken: jest.fn().mockReturnValue('access'),
                signRefreshToken: jest.fn().mockReturnValue('refresh'),
            }
            const response = createResponse()
            const result = await new AuthController(authService as never).mobileGoogleExchange(
                { code: 'c'.repeat(64), verifier: 'v'.repeat(64) },
                { headers: {}, socket: {} } as never,
                response as never,
            )
            expect(authService.redeemMobileExchangeCode).toHaveBeenCalledWith(
                'c'.repeat(64),
                'v'.repeat(64),
            )
            expect(result.data).toMatchObject({ user: { id: 'u1' }, access_token: 'access' })
            expect(response.cookie).toHaveBeenCalledWith(
                'refreshToken',
                'refresh',
                expect.anything(),
            )
        })
    })
})
