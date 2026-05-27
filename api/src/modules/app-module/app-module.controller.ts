import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common'
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
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AppModuleController {
    constructor(private appModuleService: AppModuleService) {}

    @Get()
    @ApiOperation({ summary: 'List all modules' })
    async getAll() {
        const data = await this.appModuleService.getAll()
        return successResponse('Modules fetched', data)
    }

    @Post()
    @ApiOperation({ summary: 'Create module' })
    async create(@Body() dto: CreateAppModuleDto) {
        const data = await this.appModuleService.create(dto)
        return successResponse('Module created', data)
    }

    @Patch('reorder')
    @ApiOperation({ summary: 'Reorder modules' })
    async reorder(@Body() dto: ReorderModulesDto) {
        const data = await this.appModuleService.reorder(dto.ids)
        return successResponse(data.message)
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update module' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAppModuleDto) {
        const data = await this.appModuleService.update(id, dto)
        return successResponse('Module updated', data)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete module' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.appModuleService.delete(id)
        return successResponse(data.message)
    }
}
