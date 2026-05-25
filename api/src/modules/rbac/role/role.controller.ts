import {
    Controller, Get, Post, Put, Delete,
    Body, Param, UseGuards, HttpCode, HttpStatus, ParseUUIDPipe,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { Roles } from '../../../common/decorators/roles.decorator'
import { RoleService } from './role.service'
import { CreateRoleDto } from './dto/create-role.dto'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'
import { AssignRoleDto } from './dto/assign-role.dto'

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
    constructor(private roleService: RoleService) {}

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all roles (admin)' })
    findAll() {
        return this.roleService.findAll()
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Get role by ID (admin)' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.roleService.findById(id)
    }

    @Get(':id/permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Get permissions for a role (admin)' })
    getRolePermissions(@Param('id', ParseUUIDPipe) id: string) {
        return this.roleService.getRolePermissions(id)
    }

    @Post()
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create role (admin)' })
    create(@Body() dto: CreateRoleDto) {
        return this.roleService.create(dto)
    }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update role (admin)' })
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRoleDto) {
        return this.roleService.update(id, dto)
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete role (admin)' })
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.roleService.remove(id)
    }

    @Post(':id/permissions')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign permissions to role (admin)' })
    assignPermissions(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignPermissionsDto) {
        return this.roleService.assignPermissions(id, dto.permissionIds)
    }

    @Post('users/:userId/assign')
    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign role to user (admin)' })
    assignRoleToUser(@Param('userId', ParseUUIDPipe) userId: string, @Body() dto: AssignRoleDto) {
        return this.roleService.assignRoleToUser(userId, dto.roleId)
    }

    @Delete('users/:userId/role')
    @Roles('admin')
    @ApiOperation({ summary: 'Remove role from user (admin)' })
    removeRoleFromUser(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.roleService.removeRoleFromUser(userId)
    }

    @Get('users/:userId')
    @Roles('admin')
    @ApiOperation({ summary: 'Get roles for user (admin)' })
    getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.roleService.getUserRoles(userId)
    }
}
