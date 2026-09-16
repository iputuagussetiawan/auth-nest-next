import { ForbiddenException, NotFoundException } from '../../common/exceptions/app-error'
import { SessionService } from './session.service'

function query(result: unknown[]) {
    return {
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(result),
        orderBy: jest.fn().mockResolvedValue(result),
    }
}

describe('SessionService', () => {
    it('maps sessions and marks the current session', async () => {
        const sessions = [
            {
                id: 'current', ipAddress: '127.0.0.1', userAgent: 'Mozilla/5.0 Chrome/120.0.0.0',
                expiredAt: new Date('2026-02-01'), updatedAt: new Date('2026-01-02'), createdAt: new Date('2026-01-01'),
            },
            { id: 'other', ipAddress: null, userAgent: null, expiredAt: null, updatedAt: new Date(), createdAt: new Date() },
        ]
        const db = { select: jest.fn().mockReturnValue(query(sessions)) }
        const service = new SessionService(db as never)

        await expect(service.getSessions('user-id', 'current')).resolves.toEqual([
            expect.objectContaining({ id: 'current', isCurrent: true, browser: expect.stringContaining('Chrome'), device: 'desktop' }),
            expect.objectContaining({ id: 'other', isCurrent: false, browser: 'Unknown', os: 'Unknown', device: 'Unknown' }),
        ])
    })

    it('maps sessions excluding the current session', async () => {
        const row = { id: 'other', ipAddress: '10.0.0.1', userAgent: 'Mozilla/5.0 Firefox/120.0', expiredAt: null, updatedAt: new Date(), createdAt: new Date() }
        const db = { select: jest.fn().mockReturnValue(query([row])) }
        const service = new SessionService(db as never)

        await expect(service.getOtherSessions('user-id', 'current')).resolves.toEqual([
            expect.objectContaining({ id: 'other', isCurrent: false, ipAddress: '10.0.0.1' }),
        ])
    })

    it('revokes another session', async () => {
        const del = { where: jest.fn().mockResolvedValue(undefined) }
        const db = { select: jest.fn().mockReturnValue(query([{ id: 'other' }])), delete: jest.fn().mockReturnValue(del) }
        const service = new SessionService(db as never)

        await expect(service.revokeSession('user-id', 'other', 'current')).resolves.toEqual({ message: 'Session revoked' })
        expect(del.where).toHaveBeenCalled()
    })

    it('rejects missing and current sessions', async () => {
        const missing = new SessionService({ select: jest.fn().mockReturnValue(query([])) } as never)
        await expect(missing.revokeSession('user-id', 'missing', 'current')).rejects.toBeInstanceOf(NotFoundException)

        const current = new SessionService({ select: jest.fn().mockReturnValue(query([{ id: 'current' }])) } as never)
        await expect(current.revokeSession('user-id', 'current', 'current')).rejects.toBeInstanceOf(ForbiddenException)
    })

    it('revokes all other sessions', async () => {
        const del = { where: jest.fn().mockResolvedValue(undefined) }
        const db = { delete: jest.fn().mockReturnValue(del) }
        const service = new SessionService(db as never)

        await expect(service.revokeOtherSessions('user-id', 'current')).resolves.toEqual({ message: 'All other sessions revoked' })
        expect(db.delete).toHaveBeenCalled()
        expect(del.where).toHaveBeenCalled()
    })
})
