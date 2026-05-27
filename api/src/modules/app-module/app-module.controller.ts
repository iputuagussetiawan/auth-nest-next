import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Req, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { AppModuleService } from './app-module.service'
import { CreateAppModuleDto } from './dto/create-app-module.dto'
import { UpdateAppModuleDto } from './dto/update-app-module.dto'
import { ReorderModulesDto } from './dto/reorder-modules.dto'

@ApiTags('app-modules')
@ApiBearerAuth('access-token')
@Controller('app-modules')
export class AppModuleController {
    constructor(private appModuleService: AppModuleService) {}

    // Any authenticated user — returns only modules they can access
    @Get('my')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get modules accessible to current user' })
    async getMyModules(@Req() req: any) {
        const data = await this.appModuleService.getMyModules(req.user?.userId)
        return successResponse('My modules', data)
    }

    // Admin only below
    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'List all modules (admin)' })
    async getAll() {
        const data = await this.appModuleService.getAll()
        return successResponse('Modules fetched', data)
    }

    @Post()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create module (admin)' })
    async create(@Body() dto: CreateAppModuleDto) {
        const data = await this.appModuleService.create(dto)
        return successResponse('Module created', data)
    }

    @Patch('reorder')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Reorder modules (admin)' })
    async reorder(@Body() dto: ReorderModulesDto) {
        const data = await this.appModuleService.reorder(dto.ids)
        return successResponse(data.message)
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update module (admin)' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAppModuleDto) {
        const data = await this.appModuleService.update(id, dto)
        return successResponse('Module updated', data)
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete module (admin)' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.appModuleService.delete(id)
        return successResponse(data.message)
    }
}
