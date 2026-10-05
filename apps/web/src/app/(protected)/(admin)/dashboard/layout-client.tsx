'use client'

import { useEffect, useState, type ReactNode } from 'react'

import { AppSidebar } from '@/components/app-sidebar'
import DashboardHeader from '@/components/layouts/backend/DashboardHeader'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

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
