import * as crypto from 'crypto'
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { Request, Response } from 'express'

import { BadRequestException } from '../../common/exceptions/app-error'

/**
 * Google sign-in for the mobile app. The app can't receive our cookies from the system browser, so:
 *   1. POST /auth/google/mobile/start gives the app a browser URL and a secret (the "verifier")
 *   2. the browser runs the normal Google flow, starting on the callback's host so the OAuth state
 *      cookie comes back to the callback
 *   3. the callback sends the browser to the app's deep link with a one-time code
 *   4. the app trades the code plus its secret for a session at POST /auth/google/mobile/exchange
 * The secret never passes through the browser, so a code caught by another app is useless (PKCE).
 */

export const MOBILE_OAUTH_COOKIE = 'oauthMobile'
const MOBILE_OAUTH_MAX_AGE = 10 * 60 * 1000 // 10 minutes, like the OAuth state cookie
export const HEX_64 = /^[0-9a-f]{64}$/

export type MobileOAuthFlow = { redirectUri: string; challenge: string }

export const sha256Hex = (value: string) => crypto.createHash('sha256').update(value).digest('hex')

/** Deep-link schemes the app may be sent back to. exp:// is Expo Go, so development only. */
function allowedSchemes() {
    const schemes = (process.env.MOBILE_APP_SCHEMES || 'myauthmobile')
        .split(',')
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    if (process.env.NODE_ENV !== 'production') schemes.push('exp')
    return schemes
}

export function isAllowedMobileRedirect(uri: unknown): uri is string {
    if (typeof uri !== 'string' || uri.length > 500) return false
    try {
        const scheme = new URL(uri).protocol.replace(/:$/, '').toLowerCase()
        return allowedSchemes().includes(scheme)
    } catch {
        return false
    }
}

/**
 * Where Google sends mobile sign-ins back to. A phone can't reach a localhost callback, so in
 * development GOOGLE_MOBILE_CALLBACK_URL can point at a public tunnel to the API while the web keeps
 * GOOGLE_CALLBACK_URL. Both must be registered with Google.
 */
export function mobileCallbackUrl() {
    return process.env.GOOGLE_MOBILE_CALLBACK_URL || process.env.GOOGLE_CALLBACK_URL!
}

/** Same host as the mobile callback: that's where the OAuth state cookie has to be set */
export function mobileBeginUrl(redirectUri: string, challenge: string) {
    const url = new URL(mobileCallbackUrl().replace(/\/callback\/?$/, '/mobile/begin'))
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('challenge', challenge)
    return url.toString()
}

export function mobileRedirect(redirectUri: string, params: Record<string, string>) {
    const url = new URL(redirectUri)
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value))
    return url.toString()
}

const cookieOptions = () => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    // Lax so it comes back on the redirect from Google, like the state cookie
    sameSite: 'lax' as const,
    path: '/',
})

/** Runs before the Google redirect on /auth/google/mobile/begin: remembers where the app waits */
@Injectable()
export class MobileOAuthBeginGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>()
        const res = context.switchToHttp().getResponse<Response>()
        const { redirect_uri: redirectUri, challenge } = req.query
        if (
            !isAllowedMobileRedirect(redirectUri) ||
            typeof challenge !== 'string' ||
            !HEX_64.test(challenge)
        ) {
            throw new BadRequestException('Invalid mobile sign-in request')
        }
        const flow: MobileOAuthFlow = { redirectUri, challenge }
        res.cookie(MOBILE_OAUTH_COOKIE, JSON.stringify(flow), {
            ...cookieOptions(),
            maxAge: MOBILE_OAUTH_MAX_AGE,
        })
        return true
    }
}

/** The Google redirect for a mobile sign-in, using the mobile callback URL */
@Injectable()
export class MobileGoogleAuthGuard extends AuthGuard('google') {
    getAuthenticateOptions() {
        return { callbackURL: mobileCallbackUrl() }
    }
}

/** A web sign-in clears any mobile flow left in this browser, so it is never handed to the app */
@Injectable()
export class ClearMobileOAuthGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        context
            .switchToHttp()
            .getResponse<Response>()
            .clearCookie(MOBILE_OAUTH_COOKIE, cookieOptions())
        return true
    }
}

/** The mobile flow this callback belongs to, if any, without using it up */
export function peekMobileFlow(req: Request): MobileOAuthFlow | null {
    const raw: unknown = req.cookies?.[MOBILE_OAUTH_COOKIE]
    if (typeof raw !== 'string') return null
    try {
        const flow = JSON.parse(raw) as Partial<MobileOAuthFlow>
        if (
            isAllowedMobileRedirect(flow.redirectUri) &&
            typeof flow.challenge === 'string' &&
            HEX_64.test(flow.challenge)
        ) {
            return { redirectUri: flow.redirectUri, challenge: flow.challenge }
        }
    } catch {
        // Malformed cookie: treat it as a web sign-in
    }
    return null
}

/** The mobile flow this callback belongs to, if any. One use only. */
export function takeMobileFlow(req: Request, res: Response): MobileOAuthFlow | null {
    if (req.cookies?.[MOBILE_OAUTH_COOKIE] !== undefined) {
        res.clearCookie(MOBILE_OAUTH_COOKIE, cookieOptions())
    }
    return peekMobileFlow(req)
}
