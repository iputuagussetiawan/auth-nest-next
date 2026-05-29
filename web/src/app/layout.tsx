import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
    try {
        const base = process.env.BACKEND_URL ?? ''
        const res = await fetch(`${base}/site-settings`, { cache: 'no-store' })
        const json = res.ok ? await res.json() : null
        const s = json?.data
        const name = s?.siteName || 'App'
        const desc = s?.description || s?.tagline || ''
        return {
            title: { default: name, template: `%s | ${name}` },
            description: desc || undefined,
            openGraph: {
                siteName: name,
                description: desc || undefined,
                images: s?.logoUrl ? [{ url: s.logoUrl }] : [],
            },
        }
    } catch {
        return {
            title: { default: 'App', template: '%s | App' },
        }
    }
}

import QueryProvider from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { DbThemeProvider } from '@/providers/db-theme-provider'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { FaviconInjector } from '@/components/favicon-injector'

// Initialize the Inter font
const inter = Inter({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-inter', // Useful if using Tailwind
})


export default async function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            {/* Apply the font to the body */}
            <body className={inter.className}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <QueryProvider>
                        <FaviconInjector />
                        <DbThemeProvider>
                            <TooltipProvider>{children}</TooltipProvider>
                        </DbThemeProvider>
                    </QueryProvider>
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    )
}
