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
        <>
            {groups.map((group, idx) => (
                <SidebarGroup key={idx}>
                    {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
                    <SidebarMenu>
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
                                                >
                                                    {item.icon && <item.icon />}
                                                    <span>{item.title}</span>
                                                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                                <SidebarMenuSub>
                                                    {item.items!.map((sub) => (
                                                        <SidebarMenuSubItem key={sub.title}>
                                                            <SidebarMenuSubButton
                                                                asChild
                                                                isActive={pathname === sub.url}
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
                                    >
                                        <Link href={item.url}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            )
                        })}
                    </SidebarMenu>
                </SidebarGroup>
            ))}
        </>
    )
}
