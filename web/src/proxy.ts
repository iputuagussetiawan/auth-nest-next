import { NextResponse, type NextRequest } from 'next/server'
import { decodeJwt, jwtVerify } from 'jose' // Optional: install 'jose' for edge-runtime JWT checks

import { AUTH_COOKIE_NAME } from './lib/constants'

const protectedRoutes = ['/dashboard', '/onboarding']
const authRoutes = ['/signin', '/signup', '/register', '/forgot-password', '/reset-password']

export default async function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl
    const cookie = request.cookies.get(AUTH_COOKIE_NAME)
    const token = cookie?.value

    // --- 1. TOKEN EXPIRY CHECK (Client-Side Logic in Middleware) ---
    if (token) {
        try {
            const payload = decodeJwt(token) // Decodes without verifying signature
            const isExpired = Date.now() >= (payload.exp || 0) * 1000

            if (isExpired) {
                const response = NextResponse.redirect(new URL('/signin', request.url))
                // 🗑️ REMOVE EXPIRED TOKEN FROM BROWSER
                response.cookies.delete(AUTH_COOKIE_NAME)
                return response
            }
        } catch (e) {
            // If token is malformed, clear it
            const response = NextResponse.redirect(new URL('/signin', request.url))
            response.cookies.delete(AUTH_COOKIE_NAME)
            return response
        }
    }

    // --- 2. PROXY LOGIC ---
    if (pathname.startsWith('/api')) {
        const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
        const targetPath = pathname.replace(/^\/api/, '')
        const destination = `${BACKEND_URL}${targetPath}${search}`

        const response = NextResponse.rewrite(new URL(destination))
        response.headers.set('x-forwarded-host', request.headers.get('host') || '')

        return response
    }

    // --- 3. ROUTE PROTECTION ---
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    // Not logged in -> Protected Page
    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/signin', request.url))
    }

    // Logged in -> Auth Page (Login/Register)
    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
