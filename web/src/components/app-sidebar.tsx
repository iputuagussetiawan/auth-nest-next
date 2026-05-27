'use client'

import * as React from 'react'
import { useAuthContext } from '@/providers/auth-provider'

import { getSidebarData } from '@/lib/sidebar-menu'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher } from './team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from './ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    // 1. Destructure isFetching to be more precise about background updates
    const { isLoading, isFetching, user } = useAuthContext()

    // 2. Memoize sidebar data so it updates exactly when the user/role arrives
    const sidebarData = React.useMemo(() => {
        return getSidebarData(user)
    }, [user])

    // 3. IMPORTANT: Show a skeleton or nothing while the initial load is happening
    // If you don't do this, sidebarData will be generated with 'undefined' role
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
