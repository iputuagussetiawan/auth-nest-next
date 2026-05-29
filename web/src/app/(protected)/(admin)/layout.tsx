import type { Metadata } from 'next'
import type { ReactNode } from 'react'

import { AppSidebar } from '@/components/app-sidebar'

export const metadata: Metadata = {
    title: { template: '%s | Dashboard', default: 'Dashboard' },
}
import { DynamicBreadcrumbs } from '@/components/dynamic-breadcrumbs'
import { Separator } from '@/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur-md supports-backdrop-filter:bg-background/60">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mr-2 h-4" />
                        <DynamicBreadcrumbs />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
        </SidebarProvider>
    )
}
