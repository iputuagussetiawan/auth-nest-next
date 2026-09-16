import { api } from '@/lib/api-factory'

import type { INotificationsResponse, IUnreadCountResponse } from '../types/NotificationTypes'

export const notificationService = {
    getAll: () =>
        api.API<INotificationsResponse>('/api/notifications', { method: 'GET', cache: 'no-store' }),
    getUnreadCount: () =>
        api.API<IUnreadCountResponse>('/api/notifications/unread-count', {
            method: 'GET',
            cache: 'no-store',
        }),
    markRead: (id: string) =>
        api.API('/api/notifications/' + id + '/read', { method: 'PATCH', cache: 'no-store' }),
    markAllRead: () =>
        api.API('/api/notifications/read-all', { method: 'PATCH', cache: 'no-store' }),
}
