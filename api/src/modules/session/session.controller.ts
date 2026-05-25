import { Controller, Get, Delete, Param, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { Request } from 'express'

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { successResponse } from '../../common/helpers/response.helper'
import { SessionService } from './session.service'

@ApiTags('sessions')
@ApiBearerAuth('access-token')
@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
    constructor(private sessionService: SessionService) {}

    @Get()
    @ApiOperation({ summary: 'List all active sessions with device info' })
    @ApiResponse({ status: 200, description: 'List of sessions' })
    async getSessions(@Req() req: Request) {
        const user = req.user as any
        const data = await this.sessionService.getSessions(user.userId, user.sessionId)
        return successResponse('Sessions fetched', data)
    }

    @Get('others')
    @ApiOperation({ summary: 'Get all sessions except current' })
    @ApiResponse({ status: 200, description: 'List of other active sessions' })
    async getOtherSessions(@Req() req: Request) {
        const user = req.user as any
        const data = await this.sessionService.getOtherSessions(user.userId, user.sessionId)
        return successResponse('Sessions fetched', data)
    }

    @Delete('others')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Revoke all sessions except current' })
    @ApiResponse({ status: 200, description: 'All other sessions revoked' })
    async revokeOtherSessions(@Req() req: Request) {
        const user = req.user as any
        await this.sessionService.revokeOtherSessions(user.userId, user.sessionId)
        return successResponse('All other sessions revoked')
    }

    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Revoke a specific session by ID' })
    @ApiResponse({ status: 200, description: 'Session revoked' })
    @ApiResponse({ status: 403, description: 'Cannot revoke current session' })
    @ApiResponse({ status: 404, description: 'Session not found' })
    async revokeSession(@Req() req: Request, @Param('id') id: string) {
        const user = req.user as any
        await this.sessionService.revokeSession(user.userId, id, user.sessionId)
        return successResponse('Session revoked')
    }
}
