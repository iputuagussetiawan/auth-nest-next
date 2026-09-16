'use client'

import { ChevronLeft, ChevronRight, Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export function DashboardSidebarCollapseToggle() {
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
                    className="border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary h-8 w-8 rounded-full border shadow-none transition-all"
                >
                    <Icon className="h-4 w-4" />
                    <span className="sr-only">{label}</span>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom">{label}</TooltipContent>
        </Tooltip>
    )
}

export function DashboardSidebarMobileToggle() {
    const { toggleSidebar } = useSidebar()

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="border-border/60 bg-card text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary h-9 w-9 rounded-full border shadow-none transition-all sm:hidden"
        >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
        </Button>
    )
}
