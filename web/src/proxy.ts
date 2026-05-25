import { NextResponse, type NextRequest } from 'next/server'

import { AUTH_COOKIE_NAME } from './lib/constants'

const protectedRoutes = ['/dashboard', '/onboarding']
const authRoutes = ['/signin', '/signup', '/register', '/forgot-password', '/reset-password']

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value

    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
    const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

    if (isProtectedRoute && !token) {
        return NextResponse.redirect(new URL('/signin', request.url))
    }

    if (isAuthRoute && token) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
