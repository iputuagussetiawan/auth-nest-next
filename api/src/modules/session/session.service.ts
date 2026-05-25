import { Inject, Injectable } from '@nestjs/common'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, and, ne } from 'drizzle-orm'
import { UAParser } from 'ua-parser-js'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { sessions } from '../../database/schema/sessions.schema'
import { NotFoundException, ForbiddenException } from '../../common/exceptions/app-error'

@Injectable()
export class SessionService {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {}

    private parseDevice(userAgent: string | null) {
        if (!userAgent) return { browser: 'Unknown', os: 'Unknown', device: 'Unknown' }

        const parser = new UAParser(userAgent)
        const browser = parser.getBrowser()
        const os = parser.getOS()
        const device = parser.getDevice()

        return {
            browser: browser.name ? `${browser.name} ${browser.version ?? ''}`.trim() : 'Unknown',
            os: os.name ? `${os.name} ${os.version ?? ''}`.trim() : 'Unknown',
            device: device.type ?? 'desktop',
        }
    }

    async getSessions(userId: string, currentSessionId: string) {
        const rows = await this.db
            .select()
            .from(sessions)
            .where(eq(sessions.userId, userId))
            .orderBy(sessions.updatedAt)

        return rows.map((s) => ({
            id: s.id,
            isCurrent: s.id === currentSessionId,
            ipAddress: s.ipAddress ?? null,
            userAgent: s.userAgent ?? null,
            expiredAt: s.expiredAt,
            lastActiveAt: s.updatedAt,
            createdAt: s.createdAt,
            ...this.parseDevice(s.userAgent),
        }))
    }

    async revokeSession(userId: string, sessionId: string, currentSessionId: string) {
        const [session] = await this.db
            .select()
            .from(sessions)
            .where(and(eq(sessions.id, sessionId), eq(sessions.userId, userId)))
            .limit(1)

        if (!session) throw new NotFoundException('Session not found')
        if (sessionId === currentSessionId) {
            throw new ForbiddenException('Cannot revoke your current session — use logout instead')
        }

        await this.db.delete(sessions).where(eq(sessions.id, sessionId))

        return { message: 'Session revoked' }
    }

    async getOtherSessions(userId: string, currentSessionId: string) {
        const rows = await this.db
            .select()
            .from(sessions)
            .where(and(eq(sessions.userId, userId), ne(sessions.id, currentSessionId)))
            .orderBy(sessions.updatedAt)

        return rows.map((s) => ({
            id: s.id,
            isCurrent: false,
            ipAddress: s.ipAddress ?? null,
            userAgent: s.userAgent ?? null,
            expiredAt: s.expiredAt,
            lastActiveAt: s.updatedAt,
            createdAt: s.createdAt,
            ...this.parseDevice(s.userAgent),
        }))
    }

    async revokeOtherSessions(userId: string, currentSessionId: string) {
        await this.db
            .delete(sessions)
            .where(and(eq(sessions.userId, userId), ne(sessions.id, currentSessionId)))

        return { message: 'All other sessions revoked' }
    }
}
