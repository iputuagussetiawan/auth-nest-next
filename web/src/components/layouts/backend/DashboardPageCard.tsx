import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface DashboardPageCardProps {
    children: ReactNode
    className?: string
}

export default function DashboardPageCard({ children, className }: DashboardPageCardProps) {
    return (
        <div
            className={cn(
                'border-border/60 bg-card min-w-0 space-y-4 rounded-3xl border p-4 shadow-[0_10px_30px_-15px_rgba(15,23,42,0.12)] sm:p-5',
                className,
            )}
        >
            {children}
        </div>
    )
}
