import {
    Controller, Get, Post, Put, Delete,
    Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { Roles } from '../../../common/decorators/roles.decorator'
import { PermissionService } from './permission.service'
import { CreatePermissionDto } from './dto/create-permission.dto'

@ApiTags('permissions')
@ApiBearerAuth('access-token')
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PermissionController {
    constructor(private permissionService: PermissionService) {}

    @Get()
    @ApiOperation({ summary: 'Get all permissions (admin)' })
    findAll() {
        return this.permissionService.findAll()
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get permission by ID (admin)' })
    findOne(@Param('id') id: string) {
        return this.permissionService.findById(id)
    }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create permission (admin)' })
    create(@Body() dto: CreatePermissionDto) {
        return this.permissionService.create(dto)
    }

    @Put(':id')
    @ApiOperation({ summary: 'Update permission (admin)' })
    update(@Param('id') id: string, @Body() dto: CreatePermissionDto) {
        return this.permissionService.update(id, dto)
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete permission (admin)' })
    remove(@Param('id') id: string) {
        return this.permissionService.remove(id)
    }
}
