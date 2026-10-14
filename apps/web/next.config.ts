import type { NextConfig } from 'next'

// Sent with every page and /api response. Only directives that can't break the app: no script or
// style rules, since Next's inline scripts and the injected theme <style> would need nonces first.
const securityHeaders = [
    // Stop other sites from framing the app (clickjacking on sign-in and account pages)
    { key: 'X-Frame-Options', value: 'DENY' },
    {
        key: 'Content-Security-Policy',
        value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'",
    },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
]

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
    },
    async headers() {
        return [{ source: '/:path*', headers: securityHeaders }]
    },
    /* config options here */
    // async rewrites() {
    //   return [
    //     {
    //       source: '/api/:path*',
    //       destination: 'http://localhost:8000/:path*', // Your Express Backend
    //     },
    //   ]
    // },
}

export default nextConfig
