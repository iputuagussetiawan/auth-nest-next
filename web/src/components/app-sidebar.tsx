'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'

import { useAuthContext } from '@/providers/auth-provider'
import { getSidebarData } from '@/lib/sidebar-menu'
import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'

import { NavMain } from './nav-main'
import { NavUser } from './nav-user'
import { TeamSwitcher, type SwitcherItem } from './team-switcher'
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from './ui/sidebar'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isLoading, user } = useAuthContext()
    const isAdmin = user?.role === 'admin'

    const { data: siteSettingsData } = useQuery({
        queryKey: ['site-settings'],
        queryFn: () => adminSiteSettingsService.get(),
        staleTime: 5 * 60_000,
    })

    const sidebarData = React.useMemo(() => getSidebarData(user), [user])

    if (isLoading) {
        return (
            <Sidebar collapsible="icon" {...props}>
                <div className="flex h-full items-center justify-center">
                    <div className="border-primary h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
                </div>
            </Sidebar>
        )
    }

    const logoUrl = siteSettingsData?.data?.logoUrl ?? ''
    const siteName = siteSettingsData?.data?.siteName ?? ''

    const defaultItems: SwitcherItem[] = sidebarData.teams.map((team) => ({
        key: team.name,
        name: siteName || team.name,
        subtitle: team.plan,
        icon: team.logo,
        imageUrl: logoUrl || undefined,
    }))

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader className="gap-3 px-3 pt-4 pb-3 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pt-3 group-data-[collapsible=icon]:pb-2">
                <div className="px-1 text-[10px] font-semibold tracking-[0.22em] text-sidebar-foreground/50 uppercase group-data-[collapsible=icon]:hidden">
                    Workspace
                </div>
                <TeamSwitcher
                    items={defaultItems}
                    label="Teams"
                    showAddAction={!isAdmin}
                    addActionLabel="Add team"
                />
            </SidebarHeader>
            <SidebarContent className="px-2 pb-3">
                <NavMain key={user?.id || 'guest'} groups={sidebarData.navGroups} />
            </SidebarContent>
            <SidebarFooter className="border-sidebar-border/60 gap-3 border-t px-3 pt-3 pb-4">
                {user ? <NavUser user={user} /> : <div className="p-4 text-xs">Not Logged In</div>}
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
