import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Put,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger'
import { memoryStorage } from 'multer'

import { Roles } from '../../../common/decorators/roles.decorator'
import { RolesGuard } from '../../../common/guards/roles.guard'
import { successResponse } from '../../../common/helpers/response.helper'
import { CloudinaryService } from '../../../shared/cloudinary/cloudinary.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'
import { AssignRoleDto } from './dto/assign-role.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { RoleService } from './role.service'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RoleController {
    constructor(
        private roleService: RoleService,
        private cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    @Roles('admin')
    @ApiOperation({ summary: 'Get all roles (admin)' })
    async findAll() {
        const data = await this.roleService.findAll()
        return successResponse('Roles fetched', data)
    }

    @Get('with-permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Get all roles with their permissions (admin)' })
    async findAllWithPermissions() {
        const data = await this.roleService.findAllWithPermissions()
        return successResponse('Roles with permissions fetched', data)
    }

    @Get(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Get role by ID (admin)' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.roleService.findById(id)
        return successResponse('Role fetched', data)
    }

    @Get(':id/permissions')
    @Roles('admin')
    @ApiOperation({ summary: 'Get permissions for a role (admin)' })
    async getRolePermissions(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.roleService.getRolePermissions(id)
        return successResponse('Role permissions fetched', data)
    }

    @Post()
    @Roles('admin')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create role (admin)' })
    async create(@Body() dto: CreateRoleDto) {
        const data = await this.roleService.create(dto)
        return successResponse('Role created', data)
    }

    @Put(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Update role (admin)' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRoleDto) {
        const data = await this.roleService.update(id, dto)
        return successResponse('Role updated', data)
    }

    @Delete(':id')
    @Roles('admin')
    @ApiOperation({ summary: 'Delete role (admin)' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.roleService.remove(id)
        return successResponse('Role deleted')
    }

    @Patch(':id/image')
    @Roles('admin')
    @ApiOperation({ summary: 'Upload role image to Cloudinary (admin)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { image: { type: 'string', format: 'binary' } },
            required: ['image'],
        },
    })
    @UseInterceptors(
        FileInterceptor('image', {
            storage: memoryStorage(),
            limits: { fileSize: MAX_SIZE },
            fileFilter: (_req, file, cb) => {
                if (!ALLOWED_MIME.includes(file.mimetype)) {
                    return cb(new BadRequestException('Only image files are allowed'), false)
                }
                cb(null, true)
            },
        }),
    )
    async uploadImage(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('No file provided')
        const result = await this.cloudinaryService.upload(file, 'role-images')
        const data = await this.roleService.updateRoleImage(id, result.secure_url)
        return successResponse('Role image updated', data)
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
