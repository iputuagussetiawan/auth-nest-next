import { AdminStatsController } from './admin-stats.controller'

describe('AdminStatsController', () => {
    it('returns dashboard statistics in the standard response shape', async () => {
        const stats = {
            totalUsers: 10,
            activeUsers: 8,
            unverifiedEmails: 2,
            activeSessions: 4,
            totalRoles: 3,
            totalPermissions: 12,
            usersByRole: [],
            userGrowth: [],
        }
        const service = { getStats: jest.fn().mockResolvedValue(stats) }
        const controller = new AdminStatsController(service as never)

        await expect(controller.getStats()).resolves.toEqual({
            status: 'success',
            message: 'Stats fetched',
            data: stats,
        })
        expect(service.getStats).toHaveBeenCalledTimes(1)
    })
})
