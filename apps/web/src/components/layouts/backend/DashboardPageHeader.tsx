import type { ReactNode } from 'react'

import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs'

interface PageHeaderProps {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    children?: ReactNode
    className?: string
}

export default function DashboardPageHeader({
    title,
    actions,
    children,
    className,
}: PageHeaderProps) {
    return (
        <div
            className={['border-border/60 min-w-0 border-b px-4 pb-4 sm:px-6', className]
                .filter(Boolean)
                .join(' ')}
        >
            <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 space-y-1">
                    <h2 className="text-lg font-semibold tracking-tight break-words sm:text-xl">
                        {title}
                    </h2>
                    <div>
                        <DynamicBreadcrumbs />
                    </div>
                </div>
                {actions ? (
                    <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto lg:justify-end">
                        {actions}
                    </div>
                ) : null}
            </div>
            {children ? <div className="mt-6">{children}</div> : null}
        </div>
    )
}
