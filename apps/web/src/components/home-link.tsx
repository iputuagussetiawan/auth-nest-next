'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Links to the home page. When already on it, scrolls back to the hero
// section and clears any #section hash instead of doing nothing.
export function HomeLink({
    className,
    children,
}: {
    className?: string
    children: React.ReactNode
}) {
    const pathname = usePathname()

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return
        e.preventDefault()
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })
        if (window.location.hash) {
            window.history.replaceState(window.history.state, '', window.location.pathname)
        }
    }

    return (
        <Link href="/" onClick={handleClick} className={className}>
            {children}
        </Link>
    )
}
