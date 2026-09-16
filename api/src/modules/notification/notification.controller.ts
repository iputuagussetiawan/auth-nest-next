import { Controller, Get, Param, ParseUUIDPipe, Patch, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { successResponse } from '../../common/helpers/response.helper'
import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { NotificationService } from './notification.service'

@ApiTags('notifications')
@ApiBearerAuth('access-token')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationController {
    constructor(private notificationService: NotificationService) {}

    @Get()
    @ApiOperation({ summary: 'List admin notifications' })
    async list(@Req() req: any) {
        return successResponse('Notifications fetched', await this.notificationService.list(req.user.userId))
    }

    @Get('unread-count')
    @ApiOperation({ summary: 'Get unread notification count' })
    async unreadCount(@Req() req: any) {
        return successResponse('Unread count fetched', await this.notificationService.unreadCount(req.user.userId))
    }

    @Patch('read-all')
    @ApiOperation({ summary: 'Mark all notifications as read' })
    async markAllRead(@Req() req: any) {
        return successResponse('Notifications marked as read', await this.notificationService.markAllRead(req.user.userId))
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark notification as read' })
    async markRead(@Req() req: any, @Param('id', ParseUUIDPipe) id: string) {
        return successResponse('Notification marked as read', await this.notificationService.markRead(id, req.user.userId))
    }
}
