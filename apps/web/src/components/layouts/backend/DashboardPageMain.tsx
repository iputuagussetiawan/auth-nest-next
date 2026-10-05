import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DashboardPageMainProps {
    children: ReactNode
    className?: string
}

export default function DashboardPageMain({ children, className }: DashboardPageMainProps) {
    return (
        <div className={cn('min-w-0 space-y-4 sm:space-y-5 lg:space-y-6', className)}>
            {children}
        </div>
    )
}
