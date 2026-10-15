import { OAUTH_STATE_COOKIE, OAuthCookieStateStore } from './oauth-state.store'

function request(cookies: Record<string, string> = {}) {
    const res = { cookie: jest.fn(), clearCookie: jest.fn() }
    return { req: { cookies, res } as never, res }
}

describe('OAuthCookieStateStore', () => {
    const store = new OAuthCookieStateStore()

    it('stores a random state in a cookie and hands the same value to the strategy', () => {
        const { req, res } = request()
        const callback = jest.fn()
        store.store(req, callback)
        const state = callback.mock.calls[0][1]
        expect(state).toMatch(/^[0-9a-f]{48}$/)
        expect(res.cookie).toHaveBeenCalledWith(
            OAUTH_STATE_COOKIE,
            state,
            expect.objectContaining({ httpOnly: true, sameSite: 'lax' }),
        )
    })

    it('accepts the state that matches the cookie and clears it', () => {
        const { req, res } = request({ [OAUTH_STATE_COOKIE]: 'abc123' })
        const callback = jest.fn()
        store.verify(req, 'abc123', callback)
        expect(callback).toHaveBeenCalledWith(null, true)
        expect(res.clearCookie).toHaveBeenCalledWith(OAUTH_STATE_COOKIE, { path: '/' })
    })

    it('rejects a state that does not match the cookie', () => {
        const { req } = request({ [OAUTH_STATE_COOKIE]: 'abc123' })
        const callback = jest.fn()
        store.verify(req, 'attacker', callback)
        expect(callback).toHaveBeenCalledWith(null, false, expect.anything())
    })

    it('rejects a callback that arrives without a state cookie', () => {
        const { req } = request()
        const callback = jest.fn()
        store.verify(req, 'abc123', callback)
        expect(callback).toHaveBeenCalledWith(null, false, expect.anything())
    })
})
