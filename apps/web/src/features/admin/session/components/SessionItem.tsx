'use client'

import React from 'react'
import { Globe, Loader2, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils' // Standard utility for tailwind class merging

interface SessionItemProps {
    session: {
        id: string
        isCurrent: boolean
    }
    parsedDetails: {
        Icon: React.ElementType // For dynamic components
        browser: string
        os: string
    }
    timeAgo: string
    loading?: boolean
    onDelete: (id: string) => void
}

export default function SessionItem({
    session,
    parsedDetails,
    timeAgo,
    loading,
    onDelete,
}: SessionItemProps) {
    const IconComponent = parsedDetails.Icon

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
                        {parsedDetails.browser} on {parsedDetails.os}
                    </h5>

                    <div className="mt-1.5 flex items-center gap-2">
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
                    </div>
                </div>

                {/* Delete Button - Only shown if not current session */}
                {/* {!session.isCurrent && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive size-9 rounded-full transition-colors"
                        disabled={loading}
                        onClick={() => onDelete(session.id)}
                    >
                        {loading ? (
                            <Loader2 className="size-4 animate-spin" />
                        ) : (
                            <Trash2 className="size-4" />
                        )}
                    </Button>
                )} */}
            </div>
        </div>
    )
}
