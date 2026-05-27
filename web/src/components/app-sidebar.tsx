'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'

import { useAuthContext } from '@/providers/auth-provider'
import { getSidebarData } from '@/lib/sidebar-menu'
import { adminModuleService } from '@/features/admin/services/admin-module-service'
import type { NavMainGroup } from '@/components/nav-main'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from './ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isLoading, user } = useAuthContext()

    // Uses /app-modules/my — server filters by user's role + permissions
    // Works for ALL roles, not just admins
    const { data: myModulesData } = useQuery({
        queryKey: ['my-modules', user?.id],
        queryFn: () => adminModuleService.getMyModules(),
        enabled: !!user,
        staleTime: 60_000,
    })

    const sidebarData = React.useMemo(() => {
        const base = getSidebarData(user)
        const modules = myModulesData?.data ?? []

        if (!modules.length) return base

        const dynamicGroup: NavMainGroup = {
            label: 'Pages',
            items: modules.map((m) => ({
                title: m.name,
                url: m.path,
                icon: FileText,
            })),
        }

        return { ...base, navGroups: [...base.navGroups, dynamicGroup] }
    }, [user, myModulesData])

    if (isLoading) {
        return (
            <Sidebar collapsible="icon" {...props}>
                <div className="flex h-full items-center justify-center">
                    <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
            </Sidebar>
        )
    }

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <TeamSwitcher teams={sidebarData.teams} />
            </SidebarHeader>
            <SidebarContent>
                <NavMain key={user?.id || 'guest'} groups={sidebarData.navGroups} />
            </SidebarContent>
            <SidebarFooter>
                {user ? <NavUser user={user} /> : <div className="p-4 text-xs">Not Logged In</div>}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
