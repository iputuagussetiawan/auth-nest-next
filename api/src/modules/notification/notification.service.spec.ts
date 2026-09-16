import { NotFoundException } from '@nestjs/common'

import { NotificationService } from './notification.service'

function createInsertChain(returned: unknown[]) {
    const chain = {
        values: jest.fn().mockReturnThis(),
        returning: jest.fn().mockResolvedValue(returned),
        onConflictDoNothing: jest.fn().mockResolvedValue(undefined),
    }
    return chain
}

function createSelectChain(result: unknown[]) {
    const chain = {
        from: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
        then: jest.fn((resolve: (value: unknown[]) => unknown) => resolve(result)),
    }
    return chain
}

describe('NotificationService', () => {
    it('creates a new-user notification', async () => {
        const created = { id: 'notification-id', type: 'NEW_USER' }
        const insert = createInsertChain([created])
        const db = { insert: jest.fn().mockReturnValue(insert) }
        const service = new NotificationService(db as never)

        const result = await service.notifyNewUser({
            id: 'user-id',
            email: 'new@example.com',
            provider: 'email',
        })

        expect(result).toEqual(created)
        expect(insert.values).toHaveBeenCalledWith({
            type: 'NEW_USER',
            title: 'New user registered',
            message: 'new@example.com registered with email.',
            actorUserId: 'user-id',
            metadata: { email: 'new@example.com', provider: 'email' },
        })
    })

    it('returns notifications with read state', async () => {
        const rows = [{ id: 'notification-id', isRead: false }]
        const select = createSelectChain(rows)
        const db = { select: jest.fn().mockReturnValue(select) }
        const service = new NotificationService(db as never)

        await expect(service.list('admin-id')).resolves.toEqual(rows)
        expect(select.orderBy).toHaveBeenCalled()
        expect(select.limit).toHaveBeenCalledWith(50)
    })

    it('returns a numeric unread count', async () => {
        const select = createSelectChain([{ count: '3' }])
        const db = { select: jest.fn().mockReturnValue(select) }
        const service = new NotificationService(db as never)

        await expect(service.unreadCount('admin-id')).resolves.toEqual({ count: 3 })
    })

    it('returns zero when unread count has no row', async () => {
        const select = createSelectChain([])
        const db = { select: jest.fn().mockReturnValue(select) }
        const service = new NotificationService(db as never)

        await expect(service.unreadCount('admin-id')).resolves.toEqual({ count: 0 })
    })

    it('rejects marking a missing notification as read', async () => {
        const select = createSelectChain([])
        const db = { select: jest.fn().mockReturnValue(select) }
        const service = new NotificationService(db as never)

        await expect(service.markRead('missing-id', 'admin-id')).rejects.toBeInstanceOf(NotFoundException)
    })

    it('marks an existing notification as read', async () => {
        const select = createSelectChain([{ id: 'notification-id' }])
        const insert = createInsertChain([])
        const db = {
            select: jest.fn().mockReturnValue(select),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new NotificationService(db as never)

        await expect(service.markRead('notification-id', 'admin-id')).resolves.toEqual({
            message: 'Notification marked as read',
        })
        expect(insert.values).toHaveBeenCalledWith({ notificationId: 'notification-id', userId: 'admin-id' })
        expect(insert.onConflictDoNothing).toHaveBeenCalled()
    })

    it('marks all unread notifications as read', async () => {
        const select = createSelectChain([{ notificationId: 'one' }, { notificationId: 'two' }])
        const insert = createInsertChain([])
        const db = {
            select: jest.fn().mockReturnValue(select),
            insert: jest.fn().mockReturnValue(insert),
        }
        const service = new NotificationService(db as never)

        await expect(service.markAllRead('admin-id')).resolves.toEqual({
            message: 'Notifications marked as read',
        })
        expect(insert.values).toHaveBeenCalledWith([
            { notificationId: 'one', userId: 'admin-id' },
            { notificationId: 'two', userId: 'admin-id' },
        ])
    })

    it('does not insert when there are no unread notifications', async () => {
        const select = createSelectChain([])
        const db = { select: jest.fn().mockReturnValue(select), insert: jest.fn() }
        const service = new NotificationService(db as never)

        await service.markAllRead('admin-id')

        expect(db.insert).not.toHaveBeenCalled()
    })
})
