'use client'

import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, Sparkles } from 'lucide-react'

import type { IUserProfile } from '@/features/user/types/user-type'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

import { LogoutMenuItem } from './logout-menu-item'
import { UserAvatar } from './user-avatar'

export function NavUser({ user }: { user: IUserProfile | null }) {
    const { isMobile } = useSidebar()
    // If there is no user (logged out), don't render the sidebar menu item at all
    if (!user) return null
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <UserAvatar
                                name={`${user.firstName} ${user.lastName}`}
                                image={user.profilePicture}
                            />
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
                                <span className="truncate text-xs">{user.email}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        side={isMobile ? 'bottom' : 'right'}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <UserAvatar
                                    name={`${user.firstName} ${user.lastName}`}
                                    image={user.profilePicture}
                                />
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium">{`${user.firstName} ${user.lastName}`}</span>
                                    <span className="truncate text-xs">{user.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <Sparkles />
                                Upgrade to Pro
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem>
                                <BadgeCheck />
                                Account
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <CreditCard />
                                Billing
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell />
                                Notifications
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <LogoutMenuItem />
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
