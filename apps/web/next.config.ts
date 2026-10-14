import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
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
