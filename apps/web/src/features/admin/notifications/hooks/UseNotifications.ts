'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { notificationService } from '../services/NotificationService'

export function useNotifications(enabled: boolean) {
    const queryClient = useQueryClient()

    const list = useQuery({
        queryKey: ['notifications'],
        queryFn: notificationService.getAll,
        enabled,
        staleTime: 15_000,
    })

    const unreadCount = useQuery({
        queryKey: ['notifications-unread'],
        queryFn: notificationService.getUnreadCount,
        enabled,
        refetchInterval: 30_000,
    })

    const markRead = useMutation({
        mutationFn: notificationService.markRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
        },
    })

    const markAllRead = useMutation({
        mutationFn: notificationService.markAllRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] })
        },
    })

    return { list, unreadCount, markRead, markAllRead }
}
