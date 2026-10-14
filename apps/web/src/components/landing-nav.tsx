'use client'

import * as React from 'react'
import Link from 'next/link'

const links = [
    { id: 'features', label: 'Modules' },
    { id: 'workflow', label: 'Workflow' },
    { id: 'results', label: 'Results' },
    { id: 'pricing', label: 'Pricing' },
]

// Navbar height plus a little breathing room, so a section counts as active
// once its top edge passes just under the fixed header.
const ACTIVE_OFFSET = 96

export function LandingNav() {
    const [active, setActive] = React.useState<string | null>(null)

    React.useEffect(() => {
        const update = () => {
            const atBottom =
                window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2
            if (atBottom) {
                setActive(links[links.length - 1].id)
                return
            }

            let current: string | null = null
            for (const { id } of links) {
                const el = document.getElementById(id)
                if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = id
            }
            setActive(current)
        }

        update()
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        return () => {
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
        }
    }, [])

    return (
        <nav className="hidden items-center gap-1 text-sm md:flex">
            {links.map(({ id, label }) => {
                const isActive = active === id
                return (
                    <Link
                        key={id}
                        href={`#${id}`}
                        aria-current={isActive ? 'location' : undefined}
                        className={`relative rounded-full px-3 py-1.5 transition-colors ${
                            isActive
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                        {label}
                    </Link>
                )
            })}
        </nav>
    )
}
