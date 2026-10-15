import { BadRequestException } from '../../common/exceptions/app-error'
import {
    isAllowedMobileRedirect,
    MOBILE_OAUTH_COOKIE,
    mobileBeginUrl,
    MobileOAuthBeginGuard,
    mobileRedirect,
    takeMobileFlow,
} from './google-mobile'

const CHALLENGE = 'a'.repeat(64)

function withEnv(env: Record<string, string | undefined>, run: () => void) {
    const saved = Object.fromEntries(Object.keys(env).map((k) => [k, process.env[k]]))
    Object.assign(process.env, env)
    Object.entries(env).forEach(([k, v]) => v === undefined && delete process.env[k])
    try {
        run()
    } finally {
        Object.entries(saved).forEach(([k, v]) =>
            v === undefined ? delete process.env[k] : (process.env[k] = v),
        )
    }
}

function guardContext(query: Record<string, unknown>) {
    const res = { cookie: jest.fn() }
    const context = {
        switchToHttp: () => ({ getRequest: () => ({ query }), getResponse: () => res }),
    }
    return { context: context as never, res }
}

describe('google-mobile', () => {
    describe('isAllowedMobileRedirect', () => {
        it("accepts the app's own scheme", () => {
            expect(isAllowedMobileRedirect('myauthmobile://auth/google')).toBe(true)
        })

        it('accepts Expo Go links only outside production', () => {
            const link = 'exp://192.168.1.5:8081/--/auth/google'
            withEnv({ NODE_ENV: 'development' }, () =>
                expect(isAllowedMobileRedirect(link)).toBe(true),
            )
            withEnv({ NODE_ENV: 'production' }, () =>
                expect(isAllowedMobileRedirect(link)).toBe(false),
            )
        })

        it.each([
            'https://evil.example.com/steal',
            'javascript:alert(1)',
            'not a url',
            42,
            undefined,
        ])('rejects %p', (uri) => {
            expect(isAllowedMobileRedirect(uri)).toBe(false)
        })

        it('uses MOBILE_APP_SCHEMES when set', () => {
            withEnv({ MOBILE_APP_SCHEMES: 'otherapp', NODE_ENV: 'production' }, () => {
                expect(isAllowedMobileRedirect('otherapp://cb')).toBe(true)
                expect(isAllowedMobileRedirect('myauthmobile://cb')).toBe(false)
            })
        })
    })

    it('starts the browser on the same host as the Google callback', () => {
        withEnv({ GOOGLE_CALLBACK_URL: 'https://web.example.com/api/auth/google/callback' }, () => {
            const url = new URL(mobileBeginUrl('myauthmobile://auth/google', CHALLENGE))
            expect(url.origin + url.pathname).toBe(
                'https://web.example.com/api/auth/google/mobile/begin',
            )
            expect(url.searchParams.get('redirect_uri')).toBe('myauthmobile://auth/google')
            expect(url.searchParams.get('challenge')).toBe(CHALLENGE)
        })
    })

    it('adds parameters to the app link', () => {
        expect(mobileRedirect('myauthmobile://auth/google', { code: 'abc' })).toBe(
            'myauthmobile://auth/google?code=abc',
        )
    })

    describe('MobileOAuthBeginGuard', () => {
        it('remembers the app link and challenge in a cookie', () => {
            const { context, res } = guardContext({
                redirect_uri: 'myauthmobile://auth/google',
                challenge: CHALLENGE,
            })
            expect(new MobileOAuthBeginGuard().canActivate(context)).toBe(true)
            expect(res.cookie).toHaveBeenCalledWith(
                MOBILE_OAUTH_COOKIE,
                JSON.stringify({ redirectUri: 'myauthmobile://auth/google', challenge: CHALLENGE }),
                expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
            )
        })

        it.each([
            [{ redirect_uri: 'https://evil.example.com', challenge: CHALLENGE }],
            [{ redirect_uri: 'myauthmobile://auth/google', challenge: 'short' }],
            [{ redirect_uri: 'myauthmobile://auth/google' }],
        ])('refuses %p', (query) => {
            const { context, res } = guardContext(query)
            expect(() => new MobileOAuthBeginGuard().canActivate(context)).toThrow(
                BadRequestException,
            )
            expect(res.cookie).not.toHaveBeenCalled()
        })
    })

    describe('takeMobileFlow', () => {
        const res = () => ({ clearCookie: jest.fn() })

        it('returns the flow and clears the cookie', () => {
            const response = res()
            const flow = { redirectUri: 'myauthmobile://auth/google', challenge: CHALLENGE }
            const req = { cookies: { [MOBILE_OAUTH_COOKIE]: JSON.stringify(flow) } }
            expect(takeMobileFlow(req as never, response as never)).toEqual(flow)
            expect(response.clearCookie).toHaveBeenCalledWith(
                MOBILE_OAUTH_COOKIE,
                expect.anything(),
            )
        })

        it('is a web sign-in when there is no cookie', () => {
            expect(takeMobileFlow({ cookies: {} } as never, res() as never)).toBeNull()
        })

        it('ignores a cookie pointing anywhere but the app', () => {
            const cookie = JSON.stringify({
                redirectUri: 'https://evil.example.com',
                challenge: CHALLENGE,
            })
            const req = { cookies: { [MOBILE_OAUTH_COOKIE]: cookie } }
            expect(takeMobileFlow(req as never, res() as never)).toBeNull()
        })
    })
})
