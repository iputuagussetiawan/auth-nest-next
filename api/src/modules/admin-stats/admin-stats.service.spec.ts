import { AdminStatsService } from './admin-stats.service'

function createQuery(result: unknown[]) {
    const query = {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockResolvedValue(result),
        then: jest.fn((resolve: (value: unknown[]) => unknown) => resolve(result)),
    }
    return query
}

describe('AdminStatsService', () => {
    it('aggregates dashboard statistics and maps growth data', async () => {
        const queries = [
            createQuery([{ v: 10 }]),
            createQuery([{ v: 8 }]),
            createQuery([{ v: 2 }]),
            createQuery([{ v: 4 }]),
            createQuery([{ v: 3 }]),
            createQuery([{ v: 12 }]),
            createQuery([
                { role: 'admin', count: 1 },
                { role: null, count: 9 },
            ]),
            createQuery([
                { month: 'Jan 2026', sort: new Date('2026-01-01'), users: 3 },
                { month: 'Feb 2026', sort: new Date('2026-02-01'), users: 2 },
            ]),
            createQuery([
                { month: 'Jan 2026', sessions: 7 },
            ]),
        ]
        const db = { select: jest.fn().mockImplementation(() => queries.shift()) }
        const service = new AdminStatsService(db as never)

        await expect(service.getStats()).resolves.toEqual({
            totalUsers: 10,
            activeUsers: 8,
            unverifiedEmails: 2,
            activeSessions: 4,
            totalRoles: 3,
            totalPermissions: 12,
            usersByRole: [
                { role: 'admin', count: 1 },
                { role: 'Unknown', count: 9 },
            ],
            userGrowth: [
                { month: 'Jan', users: 3, sessions: 7 },
                { month: 'Feb', users: 2, sessions: 0 },
            ],
        })

        expect(db.select).toHaveBeenCalledTimes(9)
    })

    it('uses zero values for empty aggregate queries', async () => {
        const queries = Array.from({ length: 6 }, () => createQuery([]))
        queries.push(createQuery([]), createQuery([]), createQuery([]))
        const db = { select: jest.fn().mockImplementation(() => queries.shift()) }
        const service = new AdminStatsService(db as never)

        await expect(service.getStats()).resolves.toEqual({
            totalUsers: 0,
            activeUsers: 0,
            unverifiedEmails: 0,
            activeSessions: 0,
            totalRoles: 0,
            totalPermissions: 0,
            usersByRole: [],
            userGrowth: [],
        })
    })
})
