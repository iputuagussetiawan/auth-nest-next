import { PERMISSIONS } from '@nest-auth/shared'
import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Permissions } from '../../common/decorators/permissions.decorator'
import { PermissionsGuard } from '../../common/guards/permissions.guard'
import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AdminStatsService } from './admin-stats.service'

@ApiTags('admin-stats')
@ApiBearerAuth('access-token')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Permissions(PERMISSIONS.STATS_READ)
export class AdminStatsController {
    constructor(private adminStatsService: AdminStatsService) {}

    @Get()
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    async getStats() {
        const data = await this.adminStatsService.getStats()
        return successResponse('Stats fetched', data)
    }
}
