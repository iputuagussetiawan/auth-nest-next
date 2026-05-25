import { Inject, Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { Request } from 'express'
import { eq } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import { DRIZZLE } from '../../../database/drizzle.provider'
import * as schema from '../../../database/schema'
import { users } from '../../../database/schema/users.schema'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(@Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request) => req?.cookies?.accessToken ?? null,
                ExtractJwt.fromAuthHeaderAsBearerToken(),
            ]),
            ignoreExpiration: false,
            secretOrKey: process.env.JWT_SECRET,
        })
    }

    async validate(payload: { userId: string; sessionId: string }) {
        const [user] = await this.db
            .select({ isActive: users.isActive })
            .from(users)
            .where(eq(users.id, payload.userId))
            .limit(1)
        if (!user?.isActive) throw new UnauthorizedException()
        return { userId: payload.userId, sessionId: payload.sessionId }
    }
}
