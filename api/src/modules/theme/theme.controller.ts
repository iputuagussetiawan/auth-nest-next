import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { ThemeService } from './theme.service'
import { CreateThemeDto } from './dto/create-theme.dto'
import { UpdateThemeDto } from './dto/update-theme.dto'
import { SetThemePreferenceDto } from './dto/set-theme-preference.dto'

@ApiTags('themes')
@Controller('themes')
export class ThemeController {
    constructor(private themeService: ThemeService) {}

    // Public — returns user's preferred theme or global active
    @Get('my')
    @UseGuards(OptionalJwtAuthGuard)
    @ApiOperation({ summary: 'Get my theme (preferred or global active)' })
    async getMyTheme(@Req() req: any) {
        const data = await this.themeService.getMyTheme(req.user?.userId ?? null)
        return successResponse('My theme', data)
    }

    // Public — list all themes for theme picker
    @Get('list')
    @ApiOperation({ summary: 'List all themes (public)' })
    async listPublic() {
        const data = await this.themeService.getAllPublic()
        return successResponse('Themes', data)
    }

    // Public — landing page reads this
    @Get('active')
    @ApiOperation({ summary: 'Get active theme (public)' })
    async getActive() {
        const data = await this.themeService.getActive()
        return successResponse('Active theme', data)
    }

    // Any authenticated user — save theme preference
    @Patch('preference')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Set my theme preference' })
    async setPreference(@Req() req: any, @Body() dto: SetThemePreferenceDto) {
        const data = await this.themeService.setPreference(req.user.userId, dto.themeId)
        return successResponse('Theme preference updated', data)
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
