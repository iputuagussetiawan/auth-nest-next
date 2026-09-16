'use client'

import { useEffect, useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { useAuthContext } from '@/providers/auth-provider'
import { Bell, ChevronLeft, ChevronRight, Menu } from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

function getPageTitle(pathname: string) {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]

    if (!last || last === 'dashboard') return 'Overview'
    return last.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function HeaderSidebarToggle() {
    const { toggleSidebar, state } = useSidebar()
    const Icon = state === 'collapsed' ? ChevronRight : ChevronLeft
    const label = state === 'collapsed' ? 'Expand sidebar' : 'Collapse sidebar'

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleSidebar}
                    className="border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary h-8 w-8 rounded-full border shadow-none transition-all"
                >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

function MobileSidebarToggle() {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary h-9 w-9 rounded-full border shadow-none transition-all sm:hidden"
        >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
        </Button>
    )
}

function DashboardHeader() {
    const pathname = usePathname()
    const { user } = useAuthContext()
    const workspaceLabel = user?.role ? `${user.role.replace(/[_-]/g, ' ')} workspace` : 'Workspace'
    const displayName = user?.firstName || 'there'

    return (
        <header className="bg-card sticky top-2 z-40 rounded-2xl px-3 py-2 shadow-[0_8px_24px_-16px_rgb(15_23_42_/_0.35)] transition-shadow duration-300 sm:rounded-[28px] sm:px-5 dark:shadow-[0_12px_36px_-14px_rgb(0_0_0_/_0.55)] dark:ring-1 dark:ring-white/[0.04]">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                    <div className="hidden sm:block">
                        <HeaderSidebarToggle />
                    </div>
                    <div className="min-w-0 space-y-0.5 sm:space-y-1">
                        <p className="text-muted-foreground hidden truncate text-xs font-medium tracking-[0.18em] uppercase sm:block">
                            {workspaceLabel}
                        </p>
                        <h1 className="text-md truncate font-semibold tracking-tight">
                            Good Morning, {displayName}
                        </h1>
                        <p className="text-muted-foreground hidden text-sm sm:block">
                            {getPageTitle(pathname)}
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="border-border/60 bg-card h-9 w-9 rounded-full shadow-none sm:h-10 sm:w-10"
                    >
                        <Bell className="h-4 w-4" />
                        <span className="sr-only">Notifications</span>
                    </Button>
                    <ThemeToggle />
                    <MobileSidebarToggle />
                </div>
            </div>
        </header>
    )
}

export function DashboardLayoutClient({ children }: { children: ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState<boolean | undefined>(undefined)

    useEffect(() => {
        const mql = window.matchMedia('(min-width: 1280px)')
        const onChange = () => setSidebarOpen(mql.matches)
        onChange()
        mql.addEventListener('change', onChange)
        return () => mql.removeEventListener('change', onChange)
    }, [])

    return (
        <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-background min-w-0 overflow-x-clip md:m-3 md:ml-0 md:rounded-[28px]">
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-3 sm:gap-5 sm:p-5 lg:gap-6 lg:p-7">
                    <DashboardHeader />
                    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5 lg:gap-6">
                        {children}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
