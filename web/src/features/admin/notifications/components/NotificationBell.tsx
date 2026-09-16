'use client'

import { useAuthContext } from '@/providers/auth-provider'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { useNotifications } from '../hooks/UseNotifications'

function timeAgo(date: string) {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
    if (seconds < 60) return 'just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
}

export function NotificationBell() {
    const { user } = useAuthContext()
    const isAdmin = user?.role === 'admin'
    const { list, unreadCount, markRead, markAllRead } = useNotifications(isAdmin)

    if (!isAdmin) return null

    const count = unreadCount.data?.data.count ?? 0
    const items = list.data?.data ?? []

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    className="border-border/60 bg-card relative h-9 w-9 rounded-full shadow-none sm:h-10 sm:w-10"
                >
                    <Bell className="h-4 w-4" />
                    {count > 0 && (
                        <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold">
                            {count > 9 ? '9+' : count}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0 sm:w-84">
                <div className="border-border/60 flex items-center justify-between border-b px-3 py-2.5">
                    <p className="text-sm font-semibold">Notifications</p>
                    {count > 0 && (
                        <button
                            type="button"
                            onClick={() => markAllRead.mutate()}
                            className="text-primary hover:text-primary/80 text-xs font-medium"
                        >
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {list.isLoading ? (
                        <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                            Loading…
                        </p>
                    ) : items.length === 0 ? (
                        <p className="text-muted-foreground px-3 py-6 text-center text-sm">
                            No notifications yet
                        </p>
                    ) : (
                        items.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => !item.isRead && markRead.mutate(item.id)}
                                className={cn(
                                    'hover:bg-muted/50 flex w-full flex-col gap-0.5 border-b px-3 py-2.5 text-left transition-colors last:border-b-0',
                                    !item.isRead && 'bg-primary/5',
                                )}
                            >
                                <div className="flex items-center gap-2">
                                    {!item.isRead && (
                                        <span className="bg-primary h-1.5 w-1.5 shrink-0 rounded-full" />
                                    )}
                                    <p
                                        className={cn(
                                            'truncate text-sm',
                                            item.isRead ? 'font-normal' : 'font-medium',
                                        )}
                                    >
                                        {item.title}
                                    </p>
                                    <span className="text-muted-foreground ml-auto shrink-0 text-[11px]">
                                        {timeAgo(item.createdAt)}
                                    </span>
                                </div>
                                <p className="text-muted-foreground truncate text-xs">
                                    {item.message}
                                </p>
                            </button>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}
