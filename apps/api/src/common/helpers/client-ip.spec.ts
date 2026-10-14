import { getClientIp } from './client-ip'

describe('getClientIp', () => {
    const original = process.env.PROXY_SECRET
    afterEach(() => {
        process.env.PROXY_SECRET = original
    })

    const request = (headers: Record<string, string> = {}) =>
        ({ headers, ip: '10.0.0.1', socket: {} }) as never

    it('uses the forwarded IP when the proxy secret matches', () => {
        process.env.PROXY_SECRET = 'shared-secret'
        expect(
            getClientIp(
                request({ 'x-client-ip': '203.0.113.7', 'x-proxy-secret': 'shared-secret' }),
            ),
        ).toBe('203.0.113.7')
    })

    it('ignores a forwarded IP sent without the secret', () => {
        process.env.PROXY_SECRET = 'shared-secret'
        expect(getClientIp(request({ 'x-client-ip': '203.0.113.7' }))).toBe('10.0.0.1')
    })

    it('ignores a forwarded IP sent with the wrong secret', () => {
        process.env.PROXY_SECRET = 'shared-secret'
        expect(
            getClientIp(request({ 'x-client-ip': '203.0.113.7', 'x-proxy-secret': 'guess' })),
        ).toBe('10.0.0.1')
    })

    it('ignores a forwarded value that is not an IP', () => {
        process.env.PROXY_SECRET = 'shared-secret'
        expect(
            getClientIp(request({ 'x-client-ip': 'not-an-ip', 'x-proxy-secret': 'shared-secret' })),
        ).toBe('10.0.0.1')
    })

    it('never trusts the header when no secret is configured', () => {
        delete process.env.PROXY_SECRET
        expect(getClientIp(request({ 'x-client-ip': '203.0.113.7', 'x-proxy-secret': '' }))).toBe(
            '10.0.0.1',
        )
    })
})
