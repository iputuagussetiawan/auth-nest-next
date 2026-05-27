import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'
import { eq, and, gt, count } from 'drizzle-orm'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'

import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { users } from '../../database/schema/users.schema'
import { sessions } from '../../database/schema/sessions.schema'
import { verificationCodes, VerificationTypeEnum } from '../../database/schema/verification-codes.schema'
import { MailService } from '../../shared/mail/mail.service'
import { RoleService } from '../rbac/role/role.service'
import {
    BadRequestException,
    NotFoundException,
    UnauthorizedException,
    TooManyRequestsException,
} from '../../common/exceptions/app-error'
import type { RegisterDto } from './dto/register.dto'
import type { ResetPasswordDto } from './dto/reset-password.dto'

const COOKIE_OPTS = (maxAge: number) => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge,
})

@Injectable()
export class AuthService {
    constructor(
        @Inject(DRIZZLE) private db: NodePgDatabase<typeof schema>,
        private jwtService: JwtService,
        private mailService: MailService,
        private roleService: RoleService,
    ) {}

    signAccessToken(payload: { userId: string; sessionId: string }) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1d',
        })
    }

    signRefreshToken(payload: { sessionId: string }) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '30d',
        })
    }

    async upsertSession(userId: string, userAgent: string | undefined, ipAddress?: string) {
        const expiredAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        const existing = await this.db
            .select()
            .from(sessions)
            .where(and(eq(sessions.userId, userId), eq(sessions.userAgent, userAgent ?? '')))
            .limit(1)

        if (existing.length) {
            const [updated] = await this.db
                .update(sessions)
                .set({ updatedAt: new Date(), expiredAt, ipAddress: ipAddress ?? existing[0].ipAddress })
                .where(eq(sessions.id, existing[0].id))
                .returning()
            return updated
        }

        const [created] = await this.db
            .insert(sessions)
            .values({ userId, userAgent, ipAddress, expiredAt })
            .returning()
        return created
    }

    async validateUser(email: string, password: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (!user || !user.password) return null

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return null

        if (!user.isEmailVerified) throw new UnauthorizedException('Please verify your email before logging in')
        if (!user.isActive) throw new UnauthorizedException('Account is disabled')

        const { password: _, ...safe } = user
        return safe
    }

    async register(dto: RegisterDto) {
        const firstName = dto.firstName.trim()
        const lastName = dto.lastName.trim()

        const [existing] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, dto.email))
            .limit(1)

        if (existing) throw new BadRequestException('Email already in use')

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        const [user] = await this.db
            .insert(users)
            .values({
                email: dto.email,
                firstName,
                lastName,
                password: hashedPassword,
                provider: 'email',
                providerId: dto.email,
            })
            .returning()

        const code = crypto.randomBytes(20).toString('hex')
        await this.db.insert(verificationCodes).values({
            userId: user.id,
            code,
            type: VerificationTypeEnum.EMAIL_VERIFICATION,
            expiresAt: new Date(Date.now() + 45 * 60 * 1000),
        })

        const verificationUrl = `${process.env.FRONTEND_ORIGIN}/confirm-account?code=${code}`
        try {
            await this.mailService.sendVerificationEmail(user.email, verificationUrl)
        } catch (err) {
            console.error('Failed to send verification email:', err)
        }

        const userRole = await this.roleService.findByName('user')
        if (userRole) await this.roleService.assignRoleToUser(user.id, userRole.id)

        return { userId: user.id }
    }

    async verifyEmail(code: string) {
        const [record] = await this.db
            .select()
            .from(verificationCodes)
            .where(
                and(
                    eq(verificationCodes.code, code),
                    eq(verificationCodes.type, VerificationTypeEnum.EMAIL_VERIFICATION),
                    gt(verificationCodes.expiresAt, new Date()),
                ),
            )
            .limit(1)

        if (!record) throw new BadRequestException('Invalid or expired verification code')

        await this.db
            .update(users)
            .set({ isEmailVerified: true, updatedAt: new Date() })
            .where(eq(users.id, record.userId))

        await this.db.delete(verificationCodes).where(eq(verificationCodes.id, record.id))

        return { message: 'Email verified successfully' }
    }

    async loginOrCreateAccount(data: {
        provider: string
        providerId: string
        firstName: string
        lastName: string
        email?: string
        picture?: string
    }) {
        const { provider, providerId, firstName, lastName, email, picture } = data

        let [user] = email
            ? await this.db.select().from(users).where(eq(users.email, email)).limit(1)
            : []

        if (!user) {
            const [created] = await this.db
                .insert(users)
                .values({
                    email: email ?? '',
                    firstName,
                    lastName,
                    profilePicture: picture,
                    provider,
                    providerId,
                    isEmailVerified: true,
                })
                .returning()
            user = created

            const userRole = await this.roleService.findByName('user')
            if (userRole) await this.roleService.assignRoleToUser(user.id, userRole.id)
        } else {
            await this.db
                .update(users)
                .set({ lastLogin: new Date(), updatedAt: new Date() })
                .where(eq(users.id, user.id))
        }

        return user
    }

    async forgotPassword(email: string) {
        const [user] = await this.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1)

        if (!user) return { message: 'Password reset email sent' }

        const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)
        const [{ recentCount }] = await this.db
            .select({ recentCount: count() })
            .from(verificationCodes)
            .where(
                and(
                    eq(verificationCodes.userId, user.id),
                    eq(verificationCodes.type, VerificationTypeEnum.PASSWORD_RESET),
                    gt(verificationCodes.createdAt, threeMinutesAgo),
                ),
            )

        if (recentCount >= 2) {
            throw new TooManyRequestsException('Too many requests, try again later')
        }

        const code = crypto.randomBytes(20).toString('hex')
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

        await this.db.insert(verificationCodes).values({
            userId: user.id,
            code,
            type: VerificationTypeEnum.PASSWORD_RESET,
            expiresAt,
        })

        const resetUrl = `${process.env.FRONTEND_ORIGIN}/reset-password?code=${code}&exp=${expiresAt.getTime()}`
        try {
            await this.mailService.sendPasswordResetEmail(user.email, resetUrl)
        } catch (err) {
            console.error('Failed to send password reset email:', err)
        }

        return { message: 'Password reset email sent' }
    }

    async resetPassword(dto: ResetPasswordDto) {
        const [record] = await this.db
            .select()
            .from(verificationCodes)
            .where(
                and(
                    eq(verificationCodes.code, dto.verificationCode),
                    eq(verificationCodes.type, VerificationTypeEnum.PASSWORD_RESET),
                    gt(verificationCodes.expiresAt, new Date()),
                ),
            )
            .limit(1)

        if (!record) throw new NotFoundException('Invalid or expired verification code')

        const hashedPassword = await bcrypt.hash(dto.password, 10)

        await this.db
            .update(users)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(eq(users.id, record.userId))

        await this.db.delete(verificationCodes).where(eq(verificationCodes.id, record.id))

        return { message: 'Password reset successfully' }
    }

    async refreshToken(token: string) {
        let payload: { sessionId: string }
        try {
            payload = this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            })
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token')
        }

        const [session] = await this.db
            .select()
            .from(sessions)
            .where(eq(sessions.id, payload.sessionId))
            .limit(1)

        if (!session || session.expiredAt < new Date()) {
            throw new UnauthorizedException('Session expired or revoked')
        }

        const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        await this.db
            .update(sessions)
            .set({ updatedAt: new Date(), expiredAt: newExpiry })
            .where(eq(sessions.id, session.id))

        const access_token = this.signAccessToken({ userId: session.userId, sessionId: session.id })
        const refresh_token = this.signRefreshToken({ sessionId: session.id })
        return { access_token, refresh_token }
    }

    async deleteSession(sessionId: string) {
        await this.db.delete(sessions).where(eq(sessions.id, sessionId))
    }

    static cookieOpts = COOKIE_OPTS
}
