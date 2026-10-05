import { AuthController } from './auth.controller'

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
})
