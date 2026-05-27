import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { ThemeService } from './theme.service'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'

@ApiTags('themes')
@Controller('themes')
export class ThemeController {
    constructor(private themeService: ThemeService) {}

    // Public — landing page reads this
    @Get('active')
    @ApiOperation({ summary: 'Get active theme (public)' })
    async getActive() {
        const data = await this.themeService.getActive()
        return successResponse('Active theme', data)
    }

    // Admin endpoints
    @Get()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'List all themes' })
    async getAll() {
        const data = await this.themeService.getAll()
        return successResponse('Themes fetched', data)
    }

    @Post()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create theme' })
    async create(@Body() dto: CreateThemeDto) {
        const data = await this.themeService.create(dto)
        return successResponse('Theme created', data)
    }

    @Patch(':id/activate')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Activate theme' })
    async activate(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.themeService.activate(id)
        return successResponse('Theme activated', data)
    }

    @Patch(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update theme' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateThemeDto) {
        const data = await this.themeService.update(id, dto)
        return successResponse('Theme updated', data)
    }

    @Delete(':id')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete theme' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.themeService.delete(id)
        return successResponse(data.message)
    }
}
