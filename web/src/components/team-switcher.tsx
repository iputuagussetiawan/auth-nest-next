'use client'

import * as React from 'react'
import { ChevronsUpDown, Plus } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar'

export interface SwitcherItem {
    key: string
    name: string
    subtitle?: string
    icon?: React.ElementType
    imageUrl?: string
}

export function TeamSwitcher({
    items,
    label = 'Teams',
    showAddAction = true,
    addActionLabel = 'Add team',
    initialActiveKey,
    onSelectItem,
}: {
    items: SwitcherItem[]
    label?: string
    showAddAction?: boolean
    addActionLabel?: string
    initialActiveKey?: string
    onSelectItem?: (item: SwitcherItem) => void
}) {
    const { isMobile } = useSidebar()
    const [activeItem, setActiveItem] = React.useState<SwitcherItem | null>(items[0] ?? null)

    React.useEffect(() => {
        if (!items.length) {
            setActiveItem(null)
            return
        }

        setActiveItem((current) => {
            if (initialActiveKey) {
                const preferred = items.find((item) => item.key === initialActiveKey)
                if (preferred) return preferred
            }

            if (current && items.some((item) => item.key === current.key)) return current
            return items[0]
        })
    }, [items, initialActiveKey])

    if (!activeItem) {
        return null
    }

    const ActiveIcon = activeItem.icon

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            tooltip={activeItem.name}
                            className="h-13 rounded-lg px-3 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-10 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:rounded-2xl group-data-[collapsible=icon]:px-0"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg">
                                {activeItem.imageUrl ? (
                                    <img
                                        src={activeItem.imageUrl}
                                        alt={activeItem.name}
                                        className="size-full object-contain"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                                    />
                                ) : ActiveIcon ? (
                                    <ActiveIcon className="size-4" />
                                ) : null}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                                <span className="truncate font-medium">{activeItem.name}</span>
                                {activeItem.subtitle && <span className="truncate text-xs">{activeItem.subtitle}</span>}
                            </div>
                            <ChevronsUpDown className="ml-auto group-data-[collapsible=icon]:hidden" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                        align="start"
                        side={isMobile ? 'bottom' : 'right'}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-muted-foreground text-xs">
                            {label}
                        </DropdownMenuLabel>
                        {items.map((item, index) => {
                            const ItemIcon = item.icon
                            const isActive = item.key === activeItem.key
                            return (
                                <DropdownMenuItem
                                    key={item.key}
                                    onClick={() => { setActiveItem(item); onSelectItem?.(item) }}
                                    className={`gap-2 rounded-md border p-2 ${
                                        isActive
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                            : 'border-transparent'
                                    }`}
                                >
                                    <div className={`flex size-6 items-center justify-center overflow-hidden rounded-md border ${
                                        isActive
                                            ? 'border-emerald-300 dark:border-emerald-800'
                                            : ''
                                    }`}>
                                        {item.imageUrl ? (
                                            <img
                                                src={item.imageUrl}
                                                alt={item.name}
                                                className="size-full object-contain"
                                            />
                                        ) : ItemIcon ? (
                                            <ItemIcon className="size-3.5 shrink-0" />
                                        ) : null}
                                    </div>
                                    <div className="grid min-w-0 flex-1 text-sm leading-tight">
                                        <span className="truncate font-medium">{item.name}</span>
                                        {item.subtitle && (
                                            <span className={`truncate text-xs ${
                                                isActive ? 'text-emerald-600 dark:text-emerald-500' : 'text-muted-foreground'
                                            }`}>
                                                {item.subtitle}
                                            </span>
                                        )}
                                    </div>
                                    <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                                </DropdownMenuItem>
                            )
                        })}
                        {showAddAction && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="gap-2 p-2">
                                    <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                                        <Plus className="size-4" />
                                    </div>
                                    <div className="text-muted-foreground font-medium">{addActionLabel}</div>
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
