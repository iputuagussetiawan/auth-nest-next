'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BadgeCheck, Bell, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from 'lucide-react'

import { AppSidebar } from '@/components/app-sidebar'
import { LogoutMenuItem } from '@/components/logout-menu-item'
import { ThemePickerMenuItem } from '@/components/theme-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserAvatar } from '@/components/user-avatar'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuthContext } from '@/providers/auth-provider'

function getPageTitle(pathname: string) {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]

    if (!last || last === 'dashboard') return 'Overview'

    return last.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

function getPageDescription(pathname: string) {
    const segments = pathname.split('/').filter(Boolean)
    const last = segments[segments.length - 1]

    if (!last || last === 'dashboard') {
        return 'Monitor your HR platform from one unified command center.'
    }

    return `Manage ${last.replace(/-/g, ' ')} in your admin workspace.`
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
                    className="h-11 w-11 rounded-full border border-border/60 bg-white text-muted-foreground shadow-none transition-all hover:border-primary/20 hover:bg-primary/5 hover:text-primary"
                >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

function HeaderUserMenu({
    name,
    email,
    image,
}: {
    name: string
    email: string
    image: string | null
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex min-w-[220px] items-center gap-3 rounded-full border border-border/60 bg-[#fafafa] px-3 py-2 text-left transition-colors hover:bg-muted">
                    <UserAvatar name={name} image={image} />
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{name}</p>
                        <p className="text-muted-foreground truncate text-xs">{email}</p>
                    </div>
                    <ChevronsUpDown className="size-4 text-muted-foreground" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-2xl">
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/dashboard/account">
                            <BadgeCheck className="mr-2 h-4 w-4" />
                            Account
                        </Link>
                    </DropdownMenuItem>
                    <ThemePickerMenuItem />
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <LogoutMenuItem />
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function DashboardHeader() {
    const pathname = usePathname()
    const { user } = useAuthContext()
    const pageTitle = getPageTitle(pathname)
    const pageDescription = getPageDescription(pathname)
    const displayName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Admin User'

    return (
        <header className="rounded-[28px] border border-border/60 bg-white px-5 py-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex items-center gap-3">
                    <HeaderSidebarToggle />
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase tracking-[0.18em]">
                            Admin workspace
                        </p>
                        <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>
                        <p className="text-muted-foreground text-sm">{pageDescription}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center xl:min-w-[620px] xl:justify-end">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Search users, roles, permissions..."
                            className="h-11 rounded-full border-border/60 bg-[#fafafa] pl-10 shadow-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-11 w-11 rounded-full border-border/60 bg-white shadow-none"
                        >
                            <Bell className="h-4 w-4" />
                            <span className="sr-only">Notifications</span>
                        </Button>
                        <ThemeToggle />
                        <HeaderUserMenu
                            name={displayName}
                            email={user?.email ?? 'No email'}
                            image={user?.profilePicture ?? null}
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset className="bg-[#fafafa] md:m-3 md:ml-0 md:rounded-[28px] md:border md:border-border/60">
                <div className="flex flex-1 flex-col gap-6 p-5 lg:p-7">
                    <DashboardHeader />
                    <div className="flex flex-1 flex-col gap-6">{children}</div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}

// ponytail: header search is visual-only for now; wire real global search when a backend/search UX exists.
// ponytail: notifications button is placeholder-only; connect it when notification data exists.
// ponytail: page title is pathname-derived; replace with route metadata map if titles diverge from URLs.
