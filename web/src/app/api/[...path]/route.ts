import { NextRequest, NextResponse } from 'next/server'

import { AUTH_COOKIE_NAME } from '@/lib/constants'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api'

function isAuthPath(path: string) {
    return path.startsWith('auth/')
}

function extractTokenFromSetCookie(headers: Headers): string | null {
    const cookies = headers.getSetCookie?.() ?? []
    for (const cookie of cookies) {
        const match = cookie.match(new RegExp(`${AUTH_COOKIE_NAME}=([^;]+)`))
        if (match) return match[1]
    }
    return null
}

function buildRetryHeaders(original: Headers, existingCookie: string, newToken: string): Headers {
    const updated = new Headers(original)
    const parts = existingCookie.split('; ').filter((c) => !c.startsWith(`${AUTH_COOKIE_NAME}=`))
    parts.push(`${AUTH_COOKIE_NAME}=${newToken}`)
    updated.set('cookie', parts.join('; '))
    updated.set('Authorization', `Bearer ${newToken}`)
    return updated
}

function copyResponseHeaders(from: Response, to: NextResponse) {
    from.headers.forEach((value, key) => {
        if (key.toLowerCase() !== 'set-cookie') to.headers.set(key, value)
    })
    from.headers.getSetCookie?.().forEach((c) => to.headers.append('set-cookie', c))
}

async function entries(request: NextRequest) {
    const path = request.nextUrl.pathname.replace(/^\/api\//, '')
    const targetUrl = `${API_BASE_URL}/${path}${request.nextUrl.search}`

    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.delete('x-forwarded-for')
    headers.delete('x-real-ip')
    headers.delete('x-forwarded-host')
    headers.delete('x-forwarded-proto')

    const body =
        request.method !== 'GET' && request.method !== 'HEAD'
            ? await request.arrayBuffer()
            : undefined

    try {
        const response = await fetch(targetUrl, {
            method: request.method,
            headers,
            body: body && body.byteLength > 0 ? body : undefined,
            cache: 'no-store',
        })

        if (response.status === 401 && !isAuthPath(path)) {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: { cookie: request.headers.get('cookie') ?? '' },
                cache: 'no-store',
            })

            if (refreshRes.ok) {
                const newToken = extractTokenFromSetCookie(refreshRes.headers)

                if (newToken) {
                    const retryHeaders = buildRetryHeaders(
                        headers,
                        request.headers.get('cookie') ?? '',
                        newToken,
                    )

                    const retryRes = await fetch(targetUrl, {
                        method: request.method,
                        headers: retryHeaders,
                        body: body && body.byteLength > 0 ? body : undefined,
                        cache: 'no-store',
                    })

                    const nextRes = new NextResponse(retryRes.body, {
                        status: retryRes.status,
                        statusText: retryRes.statusText,
                    })
                    copyResponseHeaders(retryRes, nextRes)
                    refreshRes.headers
                        .getSetCookie?.()
                        .forEach((c) => nextRes.headers.append('set-cookie', c))
                    return nextRes
                }
            }

            return NextResponse.json({ message: 'Session expired' }, { status: 401 })
        }

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        })
    } catch (error) {
        console.error('Proxy Error:', error)
        return NextResponse.json({ message: 'Internal Proxy Error' }, { status: 500 })
    }
}

export const GET = entries
export const POST = entries
export const PUT = entries
export const DELETE = entries
export const PATCH = entries
