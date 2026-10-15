import { NextResponse, type NextRequest } from 'next/server'

import { clientIpHeaders } from './lib/client-ip'
import {
    AUTH_COOKIE_NAME,
    DASHBOARD_URL,
    REFRESH_COOKIE_NAME,
    SESSION_EXPIRED_URL,
    SIGNIN_URL,
} from './lib/constants'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'

const protectedRoutes = ['/dashboard', '/onboarding']
const authRoutes = ['/signin', '/signup', '/forgot-password', '/reset-password']

// Refresh a little before expiry so the token can't run out while the request is being served
const EXPIRY_LEEWAY_MS = 30 * 1000

/** Reads the JWT's exp claim without verifying it; the API still verifies every token it receives */
function isExpiring(token: string) {
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        const { exp } = JSON.parse(atob(payload)) as { exp?: number }
        return typeof exp !== 'number' || exp * 1000 - EXPIRY_LEEWAY_MS < Date.now()
    } catch {
        return true
    }
}

function cookieValue(setCookies: string[], name: string) {
    for (const cookie of setCookies) {
        const match = cookie.match(new RegExp(`^${name}=([^;]*)`))
        if (match) return match[1]
    }
    return null
}

type RefreshResult =
    | { status: 'refreshed'; setCookies: string[]; accessToken: string; refreshToken: string }
    | { status: 'rejected' }
    | { status: 'unavailable' }

async function refreshSession(request: NextRequest): Promise<RefreshResult> {
    try {
        const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                cookie: request.headers.get('cookie') ?? '',
                ...clientIpHeaders(request.headers),
            },
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        })
        if (res.status === 401) return { status: 'rejected' }
        if (!res.ok) return { status: 'unavailable' }

        const setCookies = res.headers.getSetCookie()
        const accessToken = cookieValue(setCookies, AUTH_COOKIE_NAME)
        const refreshToken = cookieValue(setCookies, REFRESH_COOKIE_NAME)
        if (!accessToken || !refreshToken) return { status: 'unavailable' }
        return { status: 'refreshed', setCookies, accessToken, refreshToken }
    } catch {
        // API down or slow: carry on with what the browser has rather than signing anyone out
        return { status: 'unavailable' }
    }
}

/**
 * Access tokens live 15 minutes. Refresh one that is missing or about to expire here, before any
 * page, server action or /api call runs, so server-side fetches never see an expired token. The new
 * cookies go to the browser on the response and into this request for everything downstream.
 */
export default async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    let token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    const hasRefreshToken = request.cookies.has(REFRESH_COOKIE_NAME)

    let setCookies: string[] = []
    let clearSession = false

    // /api/auth/* is login, refresh, logout and OAuth; those manage the cookies themselves
    if (hasRefreshToken && (!token || isExpiring(token)) && !pathname.startsWith('/api/auth/')) {
        const result = await refreshSession(request)
        if (result.status === 'refreshed') {
            token = result.accessToken
            setCookies = result.setCookies
            request.cookies.set(AUTH_COOKIE_NAME, result.accessToken)
            request.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken)
        } else if (result.status === 'rejected') {
            // Session revoked or expired: the cookies are dead weight
            token = undefined
            clearSession = true
            request.cookies.delete(AUTH_COOKIE_NAME)
            request.cookies.delete(REFRESH_COOKIE_NAME)
        }
    }

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    let response: NextResponse
    if (isProtectedRoute && !token) {
        response = NextResponse.redirect(
            new URL(clearSession ? SESSION_EXPIRED_URL : SIGNIN_URL, request.url),
        )
    } else if (isAuthRoute && token) {
        response = NextResponse.redirect(new URL(DASHBOARD_URL, request.url))
    } else {
        response = NextResponse.next({ request: { headers: request.headers } })
    }

    setCookies.forEach((cookie) => response.headers.append('set-cookie', cookie))
    if (clearSession) {
        response.cookies.delete(AUTH_COOKIE_NAME)
        response.cookies.delete(REFRESH_COOKIE_NAME)
    }
    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
