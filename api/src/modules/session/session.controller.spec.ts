import { SessionController } from './session.controller'

describe('SessionController', () => {
    const service = {
        getSessions: jest.fn(),
        getOtherSessions: jest.fn(),
        revokeOtherSessions: jest.fn(),
        revokeSession: jest.fn(),
    }
    const controller = new SessionController(service as never)

    beforeEach(() => jest.clearAllMocks())

    it('forwards session requests and wraps responses', async () => {
        const req = { user: { userId: 'user-id', sessionId: 'current' } }
        service.getSessions.mockResolvedValue([{ id: 'current' }])
        service.getOtherSessions.mockResolvedValue([{ id: 'other' }])
        service.revokeOtherSessions.mockResolvedValue(undefined)
        service.revokeSession.mockResolvedValue(undefined)

        await expect(controller.getSessions(req as never)).resolves.toEqual({
            status: 'success',
            message: 'Sessions fetched',
            data: [{ id: 'current' }],
        })
        await expect(controller.getOtherSessions(req as never)).resolves.toEqual({
            status: 'success',
            message: 'Sessions fetched',
            data: [{ id: 'other' }],
        })
        await expect(controller.revokeOtherSessions(req as never)).resolves.toEqual({
            status: 'success',
            message: 'All other sessions revoked',
            data: null,
        })
        await expect(controller.revokeSession(req as never, 'other')).resolves.toEqual({
            status: 'success',
            message: 'Session revoked',
            data: null,
        })

        expect(service.getSessions).toHaveBeenCalledWith('user-id', 'current')
        expect(service.getOtherSessions).toHaveBeenCalledWith('user-id', 'current')
        expect(service.revokeOtherSessions).toHaveBeenCalledWith('user-id', 'current')
        expect(service.revokeSession).toHaveBeenCalledWith('user-id', 'other', 'current')
    })
})
