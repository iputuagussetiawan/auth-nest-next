import { UnauthorizedException } from '@nestjs/common'
import type { Profile } from 'passport-google-oauth20'

import { GoogleStrategy } from './google.strategy'

function profile(verified: boolean) {
    return {
        id: 'google-id',
        name: { givenName: 'Ann', familyName: 'Lee' },
        emails: [{ value: 'ann@example.com', verified }],
        photos: [],
    } as unknown as Profile
}

describe('GoogleStrategy', () => {
    process.env.GOOGLE_CLIENT_ID ??= 'id'
    process.env.GOOGLE_CLIENT_SECRET ??= 'secret'
    process.env.GOOGLE_CALLBACK_URL ??= 'http://localhost/callback'

    it('rejects a Google profile whose email is not verified', async () => {
        const authService = { loginOrCreateAccount: jest.fn() }
        const strategy = new GoogleStrategy(authService as never)
        await expect(strategy.validate('', '', profile(false))).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
        expect(authService.loginOrCreateAccount).not.toHaveBeenCalled()
    })

    it('signs in with a verified email', async () => {
        const authService = { loginOrCreateAccount: jest.fn().mockResolvedValue({ id: 'user-id' }) }
        const strategy = new GoogleStrategy(authService as never)
        await expect(strategy.validate('', '', profile(true))).resolves.toEqual({ id: 'user-id' })
        expect(authService.loginOrCreateAccount).toHaveBeenCalledWith(
            expect.objectContaining({ email: 'ann@example.com', providerId: 'google-id' }),
        )
    })
})
