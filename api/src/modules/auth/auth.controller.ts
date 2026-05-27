import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    Res,
    UseGuards,
    HttpCode,
    HttpStatus,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Throttle } from '@nestjs/throttler'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiCookieAuth, ApiBody } from '@nestjs/swagger'
import { Request, Response } from 'express'

import { successResponse } from '../../common/helpers/response.helper'
import { AuthService } from './auth.service'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { LocalAuthGuard } from './guards/local-auth.guard'
import { RegisterDto } from './dto/register.dto'
import { VerifyEmailDto } from './dto/verify-email.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'

const ACCESS_MAX_AGE = 15 * 60 * 1000
const REFRESH_MAX_AGE = 30 * 24 * 60 * 60 * 1000
const IS_PROD = process.env.NODE_ENV === 'production'
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000'

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    res.cookie('accessToken', accessToken, { httpOnly: true, secure: IS_PROD, sameSite: 'strict', maxAge: ACCESS_MAX_AGE })
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: IS_PROD, sameSite: 'strict', maxAge: REFRESH_MAX_AGE })
}

function clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { httpOnly: true, secure: IS_PROD, sameSite: 'strict', path: '/' })
    res.clearCookie('refreshToken', { httpOnly: true, secure: IS_PROD, sameSite: 'strict', path: '/' })
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Register new user' })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiResponse({ status: 400, description: 'Validation error or email already exists' })
    async register(@Body() dto: RegisterDto) {
        await this.authService.register(dto)
        return successResponse('User created successfully')
    }

    @Post('verify/email')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Verify email with OTP code' })
    @ApiResponse({ status: 200, description: 'Email verified' })
    @ApiResponse({ status: 400, description: 'Invalid or expired code' })
    async verifyEmail(@Body() dto: VerifyEmailDto) {
        await this.authService.verifyEmail(dto.code)
        return successResponse('Email verified successfully')
    }

    @Post('login')
    @Throttle({ default: { ttl: 60000, limit: 10 } })
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({ schema: { properties: { email: { type: 'string' }, password: { type: 'string' } }, required: ['email', 'password'] } })
    @ApiResponse({ status: 200, description: 'Logged in, sets httpOnly cookies' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user as any
        const ip = req.ip ?? req.socket.remoteAddress
        const session = await this.authService.upsertSession(user.id, req.headers['user-agent'], ip)
        const accessToken = this.authService.signAccessToken({ userId: user.id, sessionId: session.id })
        const refreshToken = this.authService.signRefreshToken({ sessionId: session.id })

        setAuthCookies(res, accessToken, refreshToken)

        return successResponse('Logged in successfully', {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
            },
            access_token: accessToken,
        })
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Refresh access token using refresh cookie' })
    @ApiCookieAuth('accessToken')
    @ApiResponse({ status: 200, description: 'New access token issued' })
    @ApiResponse({ status: 401, description: 'Refresh token missing or invalid' })
    async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token: string | undefined = req.cookies?.refreshToken
        if (!token) {
            res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Refresh token missing' })
            return
        }
        const { access_token, refresh_token } = await this.authService.refreshToken(token)
        res.cookie('accessToken', access_token, { httpOnly: true, secure: IS_PROD, sameSite: 'strict', maxAge: ACCESS_MAX_AGE })
        res.cookie('refreshToken', refresh_token, { httpOnly: true, secure: IS_PROD, sameSite: 'strict', maxAge: REFRESH_MAX_AGE })
        return successResponse('Token refreshed successfully', { access_token })
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiBearerAuth('access-token')
    @ApiOperation({ summary: 'Logout and clear auth cookies' })
    @ApiResponse({ status: 200, description: 'Logged out' })
    async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const user = req.user as any
        if (user?.sessionId) await this.authService.deleteSession(user.sessionId)
        clearAuthCookies(res)
        return successResponse('Logged out successfully')
    }

    @Post('password/forgot')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Send password reset email' })
    @ApiResponse({ status: 200, description: 'Reset email sent if account exists' })
    async forgotPassword(@Body() dto: ForgotPasswordDto) {
        await this.authService.forgotPassword(dto.email)
        return successResponse('Password reset email sent')
    }

    @Post('password/reset')
    @Throttle({ default: { ttl: 60000, limit: 5 } })
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with token' })
    @ApiResponse({ status: 200, description: 'Password reset successful' })
    @ApiResponse({ status: 400, description: 'Invalid or expired token' })
    async resetPassword(@Body() dto: ResetPasswordDto, @Res({ passthrough: true }) res: Response) {
        await this.authService.resetPassword(dto)
        res.clearCookie('accessToken', { httpOnly: true, secure: IS_PROD, sameSite: 'strict', path: '/' })
        return successResponse('Password reset successfully')
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Initiate Google OAuth login (redirects to Google)' })
    @ApiResponse({ status: 302, description: 'Redirect to Google consent screen' })
    googleLogin() {}

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    @ApiOperation({ summary: 'Google OAuth callback (handled by Google)' })
    @ApiResponse({ status: 302, description: 'Redirect to frontend after OAuth' })
    async googleCallback(@Req() req: Request, @Res() res: Response) {
        try {
            const user = req.user as any
            const ip = req.ip ?? req.socket.remoteAddress
            const session = await this.authService.upsertSession(user.id, req.headers['user-agent'], ip)
            const accessToken = this.authService.signAccessToken({ userId: user.id, sessionId: session.id })
            const refreshToken = this.authService.signRefreshToken({ sessionId: session.id })

            setAuthCookies(res, accessToken, refreshToken)
            return res.redirect(`${FRONTEND_ORIGIN}/dashboard`)
        } catch {
            return res.redirect(`${FRONTEND_ORIGIN}/signin?status=error`)
        }
    }
}
