import * as crypto from 'crypto'
import { Inject, Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { and, count, eq, gt, isNull, lt } from 'drizzle-orm'
import { NodePgDatabase } from 'drizzle-orm/node-postgres'

import {
    BadRequestException,
    NotFoundException,
    ServiceUnavailableException,
    TooManyRequestsException,
    UnauthorizedException,
} from '../../common/exceptions/app-error'
import { DRIZZLE } from '../../database/drizzle.provider'
import * as schema from '../../database/schema'
import { sessions } from '../../database/schema/auth/sessions.schema'
import { users } from '../../database/schema/auth/users.schema'
import {
    verificationCodes,
    VerificationTypeEnum,
} from '../../database/schema/auth/verification-codes.schema'
import { MailService } from '../../shared/mail/mail.service'
import { NotificationService } from '../notification/notification.service'
import { RoleService } from '../rbac/role/role.service'
import { SiteSettingsService } from '../site-settings/site-settings.service'
import type { RegisterDto } from './dto/register.dto'
import type { ResetPasswordDto } from './dto/reset-password.dto'

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000
// Parallel requests may all refresh with the same token; accept the one just replaced for a moment
const REFRESH_REUSE_GRACE_MS = 30 * 1000

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
        private notificationService: NotificationService,
        private siteSettings: SiteSettingsService,
    ) {}

    /** New accounts are closed while the site is in maintenance; existing users can still sign in */
    private async assertSignupOpen() {
        const { maintenanceMode } = await this.siteSettings.get()
        if (maintenanceMode) {
            throw new ServiceUnavailableException('Registration is closed during maintenance')
        }
    }

    signAccessToken(payload: { userId: string; sessionId: string }) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: '1d',
        })
    }

    signRefreshToken(payload: { sessionId: string; tokenId: string }) {
        return this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '30d',
        })
    }

    async createSession(userId: string, userAgent: string | undefined, ipAddress?: string) {
        const expiredAt = new Date(Date.now() + SESSION_TTL_MS)

        // One session per login so devices sharing a user agent don't share (and revoke) each other
        await this.db
            .delete(sessions)
            .where(and(eq(sessions.userId, userId), lt(sessions.expiredAt, new Date())))

        const [created] = await this.db
            .insert(sessions)
            .values({
                userId,
                userAgent,
                ipAddress,
                expiredAt,
                refreshTokenId: crypto.randomUUID(),
            })
            .returning()
        return created as typeof created & { refreshTokenId: string }
    }

    async validateUser(email: string, password: string) {
        const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1)

        if (!user || !user.password) return null

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) return null

        if (!user.isEmailVerified)
            throw new UnauthorizedException('Please verify your email before logging in')
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

        await this.assertSignupOpen()

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

        try {
            await this.notificationService.notifyNewUser({
                id: user.id,
                email: user.email,
                provider: user.provider,
            })
        } catch (error) {
            console.error('Failed to create new-user notification:', error)
        }

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
            await this.assertSignupOpen()

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

            try {
                await this.notificationService.notifyNewUser({
                    id: user.id,
                    email: user.email,
                    provider: user.provider,
                })
            } catch (error) {
                console.error('Failed to create new-user notification:', error)
            }
        } else {
            await this.db
                .update(users)
                .set({ lastLogin: new Date(), updatedAt: new Date() })
                .where(eq(users.id, user.id))
        }

        return user
    }

    async forgotPassword(email: string) {
        const [user] = await this.db.select().from(users).where(eq(users.email, email)).limit(1)

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

        // Password change invalidates every existing session for that user
        await this.db.delete(sessions).where(eq(sessions.userId, record.userId))
        await this.db.delete(verificationCodes).where(eq(verificationCodes.id, record.id))

        return { message: 'Password reset successfully' }
    }

    async refreshToken(token: string) {
        let payload: { sessionId: string; tokenId?: string }
        try {
            payload = this.jwtService.verify(token, {
                secret: process.env.JWT_REFRESH_SECRET,
            })
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token')
        }

        let session = await this.findLiveSession(payload.sessionId)
        // Tokens issued before rotation existed carry no tokenId and match a session with none
        const presented = payload.tokenId ?? null

        if (presented === session.refreshTokenId) {
            const tokenId = await this.rotateRefreshToken(session.id, presented)
            if (tokenId) return this.issueTokens(session.userId, session.id, tokenId)
            // Another request rotated this token first; judge it against the latest row
            session = await this.findLiveSession(payload.sessionId)
        }

        const justRotated =
            !!presented &&
            presented === session.previousRefreshTokenId &&
            !!session.refreshTokenId &&
            !!session.refreshRotatedAt &&
            Date.now() - session.refreshRotatedAt.getTime() < REFRESH_REUSE_GRACE_MS
        if (justRotated)
            return this.issueTokens(session.userId, session.id, session.refreshTokenId!)

        // An already-replaced refresh token was replayed: treat it as stolen and end the session
        await this.deleteSession(session.id)
        throw new UnauthorizedException('Refresh token reuse detected, please sign in again')
    }

    private async findLiveSession(sessionId: string) {
        const [session] = await this.db
            .select()
            .from(sessions)
            .where(eq(sessions.id, sessionId))
            .limit(1)
        if (!session || session.expiredAt < new Date()) {
            throw new UnauthorizedException('Session expired or revoked')
        }
        return session
    }

    /** Swaps the session's refresh token id only if it still matches, so parallel refreshes can't both win */
    private async rotateRefreshToken(sessionId: string, currentTokenId: string | null) {
        const tokenId = crypto.randomUUID()
        const now = new Date()
        const [rotated] = await this.db
            .update(sessions)
            .set({
                refreshTokenId: tokenId,
                previousRefreshTokenId: currentTokenId,
                refreshRotatedAt: now,
                expiredAt: new Date(now.getTime() + SESSION_TTL_MS),
                updatedAt: now,
            })
            .where(
                and(
                    eq(sessions.id, sessionId),
                    currentTokenId
                        ? eq(sessions.refreshTokenId, currentTokenId)
                        : isNull(sessions.refreshTokenId),
                ),
            )
            .returning({ id: sessions.id })
        return rotated ? tokenId : null
    }

    private issueTokens(userId: string, sessionId: string, tokenId: string) {
        return {
            access_token: this.signAccessToken({ userId, sessionId }),
            refresh_token: this.signRefreshToken({ sessionId, tokenId }),
        }
    }

    async deleteSession(sessionId: string) {
        await this.db.delete(sessions).where(eq(sessions.id, sessionId))
    }

    static cookieOpts = COOKIE_OPTS
}
