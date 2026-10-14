import { UnauthorizedException } from '@nestjs/common'

import { JwtStrategy } from './jwt.strategy'

function strategy(rows: unknown[]) {
    const chain = {
        from: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(rows),
    }
    process.env.JWT_SECRET ??= 'test-secret'
    return new JwtStrategy({ select: jest.fn().mockReturnValue(chain) } as never)
}

describe('JwtStrategy', () => {
    const payload = { userId: 'user-id', sessionId: 'session-id' }

    it('accepts a token whose session is live and user is active', async () => {
        await expect(strategy([{ isActive: true }]).validate(payload)).resolves.toEqual(payload)
    })

    it('rejects a token whose session was revoked or expired', async () => {
        await expect(strategy([]).validate(payload)).rejects.toBeInstanceOf(UnauthorizedException)
    })

    it('rejects a token for a disabled user', async () => {
        await expect(strategy([{ isActive: false }]).validate(payload)).rejects.toBeInstanceOf(
            UnauthorizedException,
        )
    })
})
