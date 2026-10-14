import { NotificationController } from './notification.controller'

describe('NotificationController', () => {
    const service = {
        list: jest.fn(),
        unreadCount: jest.fn(),
        markRead: jest.fn(),
        markAllRead: jest.fn(),
    }
    const controller = new NotificationController(service as never)

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('lists notifications for the authenticated admin', async () => {
        const data = [{ id: 'notification-id' }]
        service.list.mockResolvedValue(data)

        await expect(controller.list({ user: { userId: 'admin-id' } })).resolves.toEqual({
            status: 'success',
            message: 'Notifications fetched',
            data,
        })
        expect(service.list).toHaveBeenCalledWith('admin-id')
    })

    it('returns the unread count for the authenticated admin', async () => {
        service.unreadCount.mockResolvedValue({ count: 2 })

        await expect(controller.unreadCount({ user: { userId: 'admin-id' } })).resolves.toEqual({
            status: 'success',
            message: 'Unread count fetched',
            data: { count: 2 },
        })
        expect(service.unreadCount).toHaveBeenCalledWith('admin-id')
    })

    it('marks one notification as read', async () => {
        service.markRead.mockResolvedValue({ message: 'Notification marked as read' })

        await expect(
            controller.markRead({ user: { userId: 'admin-id' } }, 'notification-id'),
        ).resolves.toEqual({
            status: 'success',
            message: 'Notification marked as read',
            data: { message: 'Notification marked as read' },
        })
        expect(service.markRead).toHaveBeenCalledWith('notification-id', 'admin-id')
    })

    it('marks all notifications as read', async () => {
        service.markAllRead.mockResolvedValue({ message: 'Notifications marked as read' })

        await expect(controller.markAllRead({ user: { userId: 'admin-id' } })).resolves.toEqual({
            status: 'success',
            message: 'Notifications marked as read',
            data: { message: 'Notifications marked as read' },
        })
        expect(service.markAllRead).toHaveBeenCalledWith('admin-id')
    })
})
