import { PERMISSIONS } from '@nest-auth/shared'
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
    Req,
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
import { Request } from 'express'
import { memoryStorage } from 'multer'

import { Permissions } from '../../../common/decorators/permissions.decorator'
import { PermissionsGuard } from '../../../common/guards/permissions.guard'
import { successResponse } from '../../../common/helpers/response.helper'
import { CloudinaryService } from '../../../shared/cloudinary/cloudinary.service'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { AssignPermissionsDto } from './dto/assign-permissions.dto'
import { AssignRoleDto } from './dto/assign-role.dto'
import { CreateRoleDto } from './dto/create-role.dto'
import { RoleService } from './role.service'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024 // 2 MB

/** Same rule as PATCH /user/admin/users/:id/role: an admin demoting themself could leave no admin */
function assertNotSelf(req: Request, userId: string) {
    if ((req.user as any)?.userId === userId) {
        throw new BadRequestException('You cannot change your own role')
    }
}

@ApiTags('roles')
@ApiBearerAuth('access-token')
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
    constructor(
        private roleService: RoleService,
        private cloudinaryService: CloudinaryService,
    ) {}

    @Get()
    // Read by the Users page to label and filter users, so user:read is enough
    @Permissions(PERMISSIONS.USER_READ)
    @ApiOperation({ summary: 'Get all roles' })
    async findAll() {
        const data = await this.roleService.findAll()
        return successResponse('Roles fetched', data)
    }

    @Get('with-permissions')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Get all roles with their permissions (admin)' })
    async findAllWithPermissions() {
        const data = await this.roleService.findAllWithPermissions()
        return successResponse('Roles with permissions fetched', data)
    }

    @Get(':id')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Get role by ID (admin)' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.roleService.findById(id)
        return successResponse('Role fetched', data)
    }

    @Get(':id/permissions')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Get permissions for a role (admin)' })
    async getRolePermissions(@Param('id', ParseUUIDPipe) id: string) {
        const data = await this.roleService.getRolePermissions(id)
        return successResponse('Role permissions fetched', data)
    }

    @Post()
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create role (admin)' })
    async create(@Body() dto: CreateRoleDto) {
        const data = await this.roleService.create(dto)
        return successResponse('Role created', data)
    }

    @Put(':id')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Update role (admin)' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: CreateRoleDto) {
        const data = await this.roleService.update(id, dto)
        return successResponse('Role updated', data)
    }

    @Delete(':id')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Delete role (admin)' })
    async remove(@Param('id', ParseUUIDPipe) id: string) {
        await this.roleService.remove(id)
        return successResponse('Role deleted')
    }

    @Patch(':id/image')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
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
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign permissions to role (admin)' })
    assignPermissions(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AssignPermissionsDto) {
        return this.roleService.assignPermissions(id, dto.permissionIds)
    }

    @Post('users/:userId/assign')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Assign role to user (admin)' })
    async assignRoleToUser(
        @Req() req: Request,
        @Param('userId', ParseUUIDPipe) userId: string,
        @Body() dto: AssignRoleDto,
    ) {
        assertNotSelf(req, userId)
        await this.roleService.assertAdminOnlyTargets((req.user as any).roles, {
            userId,
            roleId: dto.roleId,
        })
        return this.roleService.assignRoleToUser(userId, dto.roleId)
    }

    @Delete('users/:userId/role')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Remove role from user (admin)' })
    async removeRoleFromUser(@Req() req: Request, @Param('userId', ParseUUIDPipe) userId: string) {
        assertNotSelf(req, userId)
        await this.roleService.assertAdminOnlyTargets((req.user as any).roles, { userId })
        return this.roleService.removeRoleFromUser(userId)
    }

    @Get('users/:userId')
    @Permissions(PERMISSIONS.ROLE_MANAGE)
    @ApiOperation({ summary: 'Get roles for user (admin)' })
    getUserRoles(@Param('userId', ParseUUIDPipe) userId: string) {
        return this.roleService.getUserRoles(userId)
    }
}
