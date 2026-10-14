'use client'

import React from 'react'
import { Globe, Loader2, LogOut } from 'lucide-react'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils' // Standard utility for tailwind class merging

interface SessionItemProps {
    session: {
        id: string
        isCurrent: boolean
        ipAddress?: string | null
    }
    parsedDetails: {
        Icon: React.ElementType // For dynamic components
        browser: string
        os: string
    }
    timeAgo: string
    loading?: boolean
    onRevoke?: (id: string) => void
}

export default function SessionItem({
    session,
    parsedDetails,
    timeAgo,
    loading,
    onRevoke,
}: SessionItemProps) {
    const IconComponent = parsedDetails.Icon
    const deviceLabel = `${parsedDetails.browser} on ${parsedDetails.os}`

    return (
        <div className="group flex w-full items-center py-3">
            {/* Icon Container */}
            <div
                className={cn(
                    'border-border bg-muted/20 text-muted-foreground hover:bg-primary/5 hover:text-primary mr-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 hover:cursor-pointer',
                    session.isCurrent &&
                        'dark:bg-primary/10 text-primary dark:text-primary border-green-500/30',
                )}
            >
                <IconComponent className="size-6" />
            </div>

            <div className="flex flex-1 items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <h5 className="text-foreground flex items-center gap-2 truncate text-sm leading-tight font-bold">
                        {deviceLabel}
                    </h5>

                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {/* Conditional Rendering for "This Device" tag */}
                        {session.isCurrent && (
                            <div className="inline-flex items-center rounded-md border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-black tracking-tighter text-green-600 uppercase dark:text-green-400">
                                This Device
                            </div>
                        )}

                        <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Globe className="size-3" />
                            {timeAgo}
                        </span>

                        {session.ipAddress && (
                            <span className="text-muted-foreground text-xs">
                                · {session.ipAddress}
                            </span>
                        )}
                    </div>
                </div>

                {/* Revoke Button - The API refuses to revoke the current session, so it's hidden there */}
                {!session.isCurrent && onRevoke && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Sign out ${deviceLabel}`}
                                className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-9 rounded-full transition-colors"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="size-4 animate-spin" />
                                ) : (
                                    <LogOut className="size-4" />
                                )}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Sign out this session?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    {deviceLabel} will be signed out immediately and will need to
                                    log in again.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={() => onRevoke(session.id)}
                                >
                                    Sign out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
        </div>
    )
}
