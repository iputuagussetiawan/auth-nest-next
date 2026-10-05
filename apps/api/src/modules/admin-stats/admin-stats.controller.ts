import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Roles } from '../../common/decorators/roles.decorator'
import { RolesGuard } from '../../common/guards/roles.guard'
import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { AdminStatsService } from './admin-stats.service'

@ApiTags('admin-stats')
@ApiBearerAuth('access-token')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminStatsController {
    constructor(private adminStatsService: AdminStatsService) {}

    @Get()
    @ApiOperation({ summary: 'Get admin dashboard statistics' })
    async getStats() {
        const data = await this.adminStatsService.getStats()
        return successResponse('Stats fetched', data)
    }
}
