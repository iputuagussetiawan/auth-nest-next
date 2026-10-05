import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { and, eq, gt } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { DRIZZLE } from '../../../database/drizzle.provider'
import * as schema from '../../../database/schema'
import { sessions } from '../../../database/schema/auth/sessions.schema'
import { users } from '../../../database/schema/auth/users.schema'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.accessToken ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            // Presence is validated at boot in main.ts
            secretOrKey: process.env.JWT_SECRET!,
        })
    }

    async validate(payload: { userId: string; sessionId: string }) {
        // The session must still exist so logout, revoke and password reset take effect immediately
        const [row] = await this.db
            .select({ isActive: users.isActive })
            .from(sessions)
            .innerJoin(users, eq(users.id, sessions.userId))
            .where(
                and(
                    eq(sessions.id, payload.sessionId),
                    eq(sessions.userId, payload.userId),
                    gt(sessions.expiredAt, new Date()),
                ),
            )
            .limit(1)
        if (!row?.isActive) throw new UnauthorizedException()
        return { userId: payload.userId, sessionId: payload.sessionId }
    }
}
