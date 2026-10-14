import { HttpException, HttpStatus } from '@nestjs/common'

import { googleAuthErrorReason, GoogleCallbackGuard } from './google-callback.guard'

function context(req: Record<string, unknown>) {
    return { switchToHttp: () => ({ getRequest: () => req }) } as never
}

describe('GoogleCallbackGuard', () => {
    it('maps known failures to a redirect reason', () => {
        expect(googleAuthErrorReason(new HttpException('x', HttpStatus.SERVICE_UNAVAILABLE))).toBe(
            'signup_closed',
        )
        expect(googleAuthErrorReason(new HttpException('x', HttpStatus.UNAUTHORIZED))).toBe(
            'email_unverified',
        )
        expect(googleAuthErrorReason(new Error('network'))).toBe('error')
    })

    it('records the reason instead of throwing', () => {
        const req: Record<string, unknown> = {}
        const guard = new GoogleCallbackGuard()
        const err = new HttpException('closed', HttpStatus.SERVICE_UNAVAILABLE)

        expect(guard.handleRequest(err, false, undefined, context(req))).toBeNull()
        expect(req.googleAuthError).toBe('signup_closed')
    })

    it('treats a cancelled consent (no user, no error) as a generic error', () => {
        const req: Record<string, unknown> = {}
        expect(new GoogleCallbackGuard().handleRequest(null, false, {}, context(req))).toBeNull()
        expect(req.googleAuthError).toBe('error')
    })

    it('passes a signed-in user through', () => {
        const req: Record<string, unknown> = {}
        const user = { id: 'user-id' }
        expect(new GoogleCallbackGuard().handleRequest(null, user, {}, context(req))).toBe(user)
        expect(req.googleAuthError).toBeUndefined()
    })
})
