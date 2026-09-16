import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put,
    UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Roles } from '../../../common/decorators/roles.decorator'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { successResponse } from '../../../common/helpers/response.helper'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CreatePermissionDto } from './dto/create-permission.dto'
import { PermissionService } from './permission.service'

@ApiTags('permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PermissionController {
    constructor(private permissionService: PermissionService) {}

    @Get()
    @ApiOperation({ summary: 'Get all permissions (admin)' })
    async findAll() {
        const data = await this.permissionService.findAll()
        return successResponse('Permissions fetched', data)
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get permission by ID (admin)' })
    async findOne(@Param('id') id: string) {
        const data = await this.permissionService.findById(id)
        return successResponse('Permission fetched', data)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create permission (admin)' })
    async create(@Body() dto: CreatePermissionDto) {
        const data = await this.permissionService.create(dto)
        return successResponse('Permission created', data)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update permission (admin)' })
    async update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
        const data = await this.permissionService.update(id, dto)
        return successResponse('Permission updated', data)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete permission (admin)' })
    async remove(@Param('id') id: string) {
        await this.permissionService.remove(id)
        return successResponse('Permission deleted')
    }
}
