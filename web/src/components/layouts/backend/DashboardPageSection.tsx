import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DashboardPageSectionProps {
    children: ReactNode
    className?: string
}

export default function DashboardPageSection({ children, className }: DashboardPageSectionProps) {
    return (
        <div
            className={cn(
                'bg-card min-w-0 rounded-2xl p-3 sm:rounded-[28px] sm:p-4 md:p-5',
                className,
            )}
        >
            {children}
        </div>
    )
}
