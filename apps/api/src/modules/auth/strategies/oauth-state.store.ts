import * as crypto from 'crypto'
import type { Request } from 'express'

export const OAUTH_STATE_COOKIE = 'oauthState'
const STATE_MAX_AGE = 10 * 60 * 1000 // 10 minutes

function stateMatches(presented: string, expected: string) {
    const a = Buffer.from(presented)
    const b = Buffer.from(expected)
    return a.length === b.length && crypto.timingSafeEqual(a, b)
}

/**
 * OAuth `state` kept in a short-lived cookie (the API has no server session). Without it anyone
 * could send a victim a callback URL carrying the attacker's own code and sign them into the
 * attacker's account. Lax, not Strict, so the cookie comes back on the redirect from Google.
 * passport-oauth2 picks the call shape by arity: store(req, cb) and verify(req, state, cb).
 */
export class OAuthCookieStateStore {
    store(req: Request, callback: (err: Error | null, state?: string) => void) {
        const state = crypto.randomBytes(24).toString('hex')
        req.res?.cookie(OAUTH_STATE_COOKIE, state, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: STATE_MAX_AGE,
        })
        callback(null, state)
    }

    verify(
        req: Request,
        providedState: string,
        callback: (err: Error | null, ok: boolean, info?: { message: string }) => void,
    ) {
        const expected: unknown = req.cookies?.[OAUTH_STATE_COOKIE]
        // One use only
        req.res?.clearCookie(OAUTH_STATE_COOKIE, { path: '/' })
        if (
            typeof expected !== 'string' ||
            typeof providedState !== 'string' ||
            !stateMatches(providedState, expected)
        ) {
            return callback(null, false, { message: 'Invalid OAuth state' })
        }
        callback(null, true)
    }
}
