export interface INotification {
    id: string
    type: string
    title: string
    message: string
    actorUserId: string | null
    metadata: Record<string, unknown> | null
    createdAt: string
    isRead: boolean
}

export interface INotificationsResponse {
    status: string
    message: string
    data: INotification[]
}

export interface IUnreadCountResponse {
    status: string
    message: string
    data: { count: number }
}
