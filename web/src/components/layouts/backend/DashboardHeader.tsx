'use client'

import { usePathname } from 'next/navigation'

import { ThemeToggle } from '@/components/theme-toggle'
import { NotificationBell } from '@/features/admin/notifications/components/NotificationBell'
import { useAuthContext } from '@/providers/auth-provider'

import {
    DashboardSidebarCollapseToggle,
    DashboardSidebarMobileToggle,
} from './DashboardSidebarToggle'
import { getDashboardPageTitle } from './dashboard-utils'

export default function DashboardHeader() {
    const pathname = usePathname()
    const { user } = useAuthContext()
    const workspaceLabel = user?.role ? `${user.role.replace(/[_-]/g, ' ')} workspace` : 'Workspace'
    const displayName = user?.firstName || 'there'

    return (
        <header className="bg-card sticky top-2 z-40 rounded-2xl px-3 py-2 shadow-[0_8px_24px_-16px_rgb(15_23_42_/_0.35)] transition-shadow duration-300 sm:rounded-[28px] sm:px-5 dark:shadow-[0_12px_36px_-14px_rgb(0_0_0_/_0.55)] dark:ring-1 dark:ring-white/[0.04]">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="hidden sm:block">
                        <DashboardSidebarCollapseToggle />
                    </div>
                    <div className="min-w-0 space-y-0.5 sm:space-y-1">
                        <p className="text-muted-foreground hidden truncate text-xs font-medium tracking-[0.18em] uppercase sm:block">
                            {workspaceLabel}
                        </p>
                        <h1 className="text-md truncate font-semibold tracking-tight">
                            Good Morning, {displayName}
                        </h1>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <NotificationBell />
                    <ThemeToggle />
                    <DashboardSidebarMobileToggle />
                </div>
            </div>
        </header>
    )
}
