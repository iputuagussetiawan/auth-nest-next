// Server-only: reads PROXY_SECRET.

export const CLIENT_IP_HEADER = 'x-client-ip'
export const PROXY_SECRET_HEADER = 'x-proxy-secret'

/**
 * Every call this app makes reaches the API from this server, so forward the visitor's IP for
 * per-visitor rate limits and session history. The API only believes it alongside the shared
 * PROXY_SECRET. On Vercel, x-real-ip and x-forwarded-for are set by the platform, not the browser.
 */
export function clientIpHeaders(incoming: Headers): Record<string, string> {
    const secret = process.env.PROXY_SECRET
    const ip = incoming.get('x-real-ip') ?? incoming.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (!secret || !ip) return {}
    return { [CLIENT_IP_HEADER]: ip, [PROXY_SECRET_HEADER]: secret }
}

/** clientIpHeaders for the request currently being rendered (server components, route handlers). */
export async function currentClientIpHeaders(): Promise<Record<string, string>> {
    const { headers } = await import('next/headers')
    return clientIpHeaders(await headers())
}
