import { timingSafeEqual } from 'crypto'
import { isIP } from 'net'
import type { Request } from 'express'

export const CLIENT_IP_HEADER = 'x-client-ip'
export const PROXY_SECRET_HEADER = 'x-proxy-secret'

function secretMatches(presented: string, expected: string) {
    const a = Buffer.from(presented)
    const b = Buffer.from(expected)
    return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * The visitor's IP. Requests through the web app's /api proxy all arrive from the proxy's own
 * address, so the proxy forwards the real one in x-client-ip. That header is only believed when it
 * comes with the shared PROXY_SECRET; anyone calling the API directly could otherwise set it.
 */
export function getClientIp(req: Pick<Request, 'headers' | 'ip' | 'socket'>): string | undefined {
    const fallback = req.ip ?? req.socket?.remoteAddress
    const secret = process.env.PROXY_SECRET
    if (!secret) return fallback

    const presented = req.headers[PROXY_SECRET_HEADER]
    const clientIp = req.headers[CLIENT_IP_HEADER]
    if (
        typeof presented === 'string' &&
        typeof clientIp === 'string' &&
        isIP(clientIp) &&
        secretMatches(presented, secret)
    ) {
        return clientIp
    }
    return fallback
}
