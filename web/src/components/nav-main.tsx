'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, type LucideIcon } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar'

export interface NavMainSubItem {
    title: string
    url: string
}

export interface NavMainItem {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: NavMainSubItem[]
}

export interface NavMainGroup {
    label?: string
    items: NavMainItem[]
}

export function NavMain({ groups }: { groups: NavMainGroup[] }) {
    const pathname = usePathname()

    return (
        <div className="flex flex-col gap-4 group-data-[collapsible=icon]:gap-2">
            {groups.map((group, idx) => (
                <div key={idx} className="space-y-1.5">
                    <SidebarGroup className="rounded-2xl border border-sidebar-border/50 bg-sidebar/40 px-2 py-2 backdrop-blur-sm group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-0">
                        {group.label && <SidebarGroupLabel className="h-6 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-sidebar-foreground/45 group-data-[collapsible=icon]:hidden">{group.label}</SidebarGroupLabel>}
                        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:items-center">
                        {group.items.map((item) => {
                            const hasSubItems = !!item.items?.length
                            const hasActiveChild =
                                item.items?.some((sub) => pathname === sub.url) ?? false
                            const isActive = pathname === item.url || hasActiveChild

                            if (hasSubItems) {
                                return (
                                    <Collapsible
                                        key={item.title}
                                        asChild
                                        defaultOpen={isActive}
                                        className="group/collapsible"
                                    >
                                        <SidebarMenuItem>
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton
                                                    tooltip={item.title}
                                                    isActive={isActive}
                                                    className="h-11 rounded-xl px-3 font-medium data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0"
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items!.map((sub) => (
                                                        <SidebarMenuSubItem key={sub.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === sub.url}
                                                                className="rounded-lg px-3 data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground"
                                                            >
                                                                <Link href={sub.url}>
                                                                    {sub.title}
                                                                </Link>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </SidebarMenuItem>
                                    </Collapsible>
                                )
                            }

                            return (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        isActive={isActive}
                                        tooltip={item.title}
                                        className="h-11 rounded-xl px-3 font-medium data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:shadow-sm group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0"
                                    >
                                        <Link href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                        </SidebarMenu>
                    </SidebarGroup>
                </div>
            ))}
        </div>
    )
}
