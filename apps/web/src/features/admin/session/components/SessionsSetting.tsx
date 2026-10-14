'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

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
import { parseUserAgent } from '@/lib/user-agent-parser'

import { sessionService } from '../services/SessionService'
import SessionItem from './SessionItem'

const formatLastActive = (date: string) => {
    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return 'Last active recently'
    return `Last active ${formatDistanceToNow(parsed, { addSuffix: true })}`
}

export default function SessionSetting() {
    const queryClient = useQueryClient()

    // 1. Fetch Sessions Query
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['sessions'],
        queryFn: () => sessionService.getAll(),
        select: (data) => data?.data || [],
    })

    // 2. Revoke a single session
    const {
        mutate: revokeSession,
        isPending: isRevoking,
        variables: revokingId,
    } = useMutation({
        mutationFn: (id: string) => sessionService.delete(id),
        onSuccess: () => {
            toast.success('Session signed out')
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to sign out session'),
    })

    // 3. Revoke every session except the current one
    const { mutate: revokeOthers, isPending: isRevokingOthers } = useMutation({
        mutationFn: () => sessionService.revokeOthers(),
        onSuccess: () => {
            toast.success('All other sessions signed out')
            queryClient.invalidateQueries({ queryKey: ['sessions'] })
        },
        onError: (e: Error) => toast.error(e.message || 'Failed to sign out other sessions'),
    })

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
                {error?.message || 'Failed to load sessions'}
            </div>
        )
    }

    const sessions = data || []
    const currentSession = sessions.find((s) => s.isCurrent)
    // Most recently active first
    const otherSessions = sessions
        .filter((s) => !s.isCurrent)
        .sort((a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime())

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
                        session={{
                            id: currentSession.id,
                            isCurrent: true,
                            ipAddress: currentSession.ipAddress,
                        }}
                        parsedDetails={parseUserAgent(currentSession.userAgent ?? '')}
                        timeAgo="Active now"
                    />
                )}
            </div>

            {/* Other Sessions */}
            <div className="border-border bg-card rounded-xl border p-6">
                <div className="mb-1 flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h3 className="text-lg font-bold">Other sessions</h3>
                        <p className="text-muted-foreground text-sm">
                            Sign out any device you don’t recognise.
                        </p>
                    </div>

                    {otherSessions.length > 0 && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isRevokingOthers || isRevoking}
                                >
                                    {isRevokingOthers && (
                                        <Loader2 className="size-4 animate-spin" />
                                    )}
                                    Sign out all other sessions
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>
                                        Sign out all other sessions?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {otherSessions.length} other{' '}
                                        {otherSessions.length === 1 ? 'session' : 'sessions'} will
                                        be signed out immediately. This device stays signed in.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        variant="destructive"
                                        onClick={() => revokeOthers()}
                                    >
                                        Sign out all
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>

                <div className="divide-border divide-y">
                    {otherSessions.length > 0 ? (
                        otherSessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                session={{
                                    id: session.id,
                                    isCurrent: false,
                                    ipAddress: session.ipAddress,
                                }}
                                parsedDetails={parseUserAgent(session.userAgent ?? '')}
                                timeAgo={formatLastActive(session.lastActiveAt)}
                                loading={
                                    isRevokingOthers || (isRevoking && revokingId === session.id)
                                }
                                onRevoke={(id) => revokeSession(id)}
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
