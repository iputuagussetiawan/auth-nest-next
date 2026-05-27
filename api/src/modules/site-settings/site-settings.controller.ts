import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SiteSettingsService } from './site-settings.service'
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto'

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
    constructor(private service: SiteSettingsService) {}

    @Get()
    @ApiOperation({ summary: 'Get site settings (public)' })
    async get() {
        const data = await this.service.get()
        return successResponse('Site settings', data)
    }

    @Patch()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update site settings' })
    async update(@Body() dto: UpdateSiteSettingsDto) {
        const data = await this.service.update(dto)
        return successResponse('Site settings updated', data)
    }
}
