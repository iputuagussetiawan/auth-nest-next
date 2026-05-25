import { Inter } from 'next/font/google'

import './globals.css'

import { AuthProvider } from '@/providers/auth-provider'
import QueryProvider from '@/providers/query-provider'
import { ThemeProvider } from '@/providers/theme-provider'

import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

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
                        <TooltipProvider>{children}</TooltipProvider>
                    </QueryProvider>
                </ThemeProvider>
                <Toaster />
            </body>
        </html>
    )
}
