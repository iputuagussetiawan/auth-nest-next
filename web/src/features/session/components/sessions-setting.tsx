'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { parseUserAgent } from '@/lib/user-agent-parser'

import { sessionService } from '../services/session-service'
import SessionItem from './session-item'

export default function SessionSetting() {
    const queryClient = useQueryClient()

    // 1. Fetch Sessions Query
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sessions'],
        queryFn: () => sessionService.getAll(),
        select: (data) => data?.data || [],
    })

    // 2. Delete Session Mutation
    const { mutate: deleteSession, isPending: isDeleting } = useMutation({
        mutationFn: (id: string) => sessionService.delete(id),
        onSuccess: () => {
            // Invalidate and refetch sessions after a delete
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
        },
    })

    // Helper to parse UA strings

    if (isLoading) {
        return (
            <div className="flex h-40 items-center justify-center">
                <Loader2 className="text-primary h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (isError) {
        return (
            <div className="text-destructive p-4 text-center">
                {(error as any)?.message || 'Failed to load sessions'}
            </div>
        )
    }

    const sessions = data || []
    const currentSession = sessions.find((s) => s.isCurrent)
    const otherSessions = sessions.filter((s) => !s.isCurrent)

    return (
        <div className="space-y-8">
            {/* Current Session */}
            <div className="border-border bg-card rounded-xl border p-6">
                <h3 className="mb-1 text-lg font-bold">Current active session</h3>
                <p className="text-muted-foreground mb-6 text-sm">
                    You’re logged into this account on this device.
                </p>
                {currentSession && (
                    <SessionItem
                        session={{ id: currentSession.id, isCurrent: true }}
                        parsedDetails={parseUserAgent(currentSession.userAgent)}
                        timeAgo="Active now"
                        onDelete={(id) => deleteSession(id)}
                        loading={isDeleting}
                    />
                )}
            </div>

            {/* Other Sessions */}
            <div className="border-border bg-card rounded-xl border p-6">
                <h3 className="mb-1 text-lg font-bold">Other sessions</h3>
                <div className="divide-border divide-y">
                    {otherSessions.length > 0 ? (
                        otherSessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                session={{ id: session.id, isCurrent: false }}
                                parsedDetails={parseUserAgent(session.userAgent)}
                                timeAgo="Last active recently"
                                loading={isDeleting}
                                onDelete={(id) => deleteSession(id)}
                            />
                        ))
                    ) : (
                        <p className="text-muted-foreground py-4 text-sm">
                            No other active sessions.
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}
