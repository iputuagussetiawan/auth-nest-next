import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'

// The session was revoked or expired but its httpOnly cookies are still in the browser.
// Clear them here, otherwise proxy.ts bounces /signin straight back to /dashboard.
export function GET(request: NextRequest) {
    const response = NextResponse.redirect(
        new URL(`${SIGNIN_URL}?status=session_expired`, request.url),
    )
    response.cookies.delete(AUTH_COOKIE_NAME)
    response.cookies.delete(REFRESH_COOKIE_NAME)
    return response
}
