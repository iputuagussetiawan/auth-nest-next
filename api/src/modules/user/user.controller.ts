import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { Request } from 'express'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'
import { AdminUpdateUserDto } from './dto/admin-update-user.dto'
import { AdminAssignRoleDto } from './dto/admin-assign-role.dto'
import { AdminCreateUserDto } from './dto/admin-create-user.dto'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

@ApiTags('user')
@ApiBearerAuth('access-token')
@Controller('user')
@UseGuards(JwtAuthGuard)
export class UserController {
    constructor(private userService: UserService) {}

    @Get('me')
    @ApiOperation({ summary: 'Get current user profile with roles, permissions and sessions' })
    @ApiResponse({ status: 200, description: 'User profile' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getMe(@Req() req: Request) {
        const user = req.user as any
        const data = await this.userService.getMe(user.userId, user.sessionId)
        return successResponse('User profile', data)
    }

    @Patch('profile')
    @ApiOperation({ summary: 'Update first and last name' })
    @ApiResponse({ status: 200, description: 'Profile updated' })
    async updateProfile(@Req() req: Request, @Body() dto: UpdateProfileDto) {
        const user = req.user as any
        const { user: updated } = await this.userService.updateProfile(user.userId, dto)
        return successResponse('Profile updated', updated)
    }

    @Patch('password')
    @ApiOperation({ summary: 'Change password (email accounts only)' })
    @ApiResponse({ status: 200, description: 'Password updated' })
    @ApiResponse({ status: 400, description: 'Wrong current password or OAuth account' })
    async updatePassword(@Req() req: Request, @Body() dto: UpdatePasswordDto) {
        const user = req.user as any
        await this.userService.updatePassword(user.userId, dto)
        return successResponse('Password updated successfully')
    }

    // ── Admin endpoints ──────────────────────────────────────────────

    @Post('admin/users')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Create user (admin)' })
    async adminCreateUser(@Body() dto: AdminCreateUserDto) {
        const user = await this.userService.adminCreateUser(dto)
        return successResponse('User created', user)
    }

    @Get('admin/users')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'List all users (admin)' })
    @ApiQuery({ name: 'search', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    async adminGetUsers(
        @Query('search') search?: string,
        @Query('page', new ParseIntPipe({ optional: true })) page = 1,
        @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    ) {
        const result = await this.userService.getAllUsers(search, page, limit)
        return successResponse('Users fetched', result)
    }

    @Patch('admin/users/:id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update user (admin)' })
    async adminUpdateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdminUpdateUserDto,
    ) {
        const user = await this.userService.adminUpdateUser(id, dto)
        return successResponse('User updated', user)
    }

    @Delete('admin/users/:id')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete user (admin)' })
    async adminDeleteUser(@Param('id', ParseUUIDPipe) id: string) {
        const result = await this.userService.adminDeleteUser(id)
        return successResponse(result.message)
    }

    @Patch('admin/users/:id/role')
    @UseGuards(RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Assign role to user (admin)' })
    async adminAssignRole(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() dto: AdminAssignRoleDto,
    ) {
        const result = await this.userService.adminAssignRole(id, dto.roleId)
        return successResponse(result.message)
    }

    // ── Self-service endpoints ────────────────────────────────────────

    @Patch('avatar')
    @ApiOperation({ summary: 'Upload profile picture to Cloudinary' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ schema: { type: 'object', properties: { profilePicture: { type: 'string', format: 'binary' } }, required: ['profilePicture'] } })
    @ApiResponse({ status: 200, description: 'Avatar updated' })
    @ApiResponse({ status: 400, description: 'No file or invalid type' })
    @UseInterceptors(
        FileInterceptor('profilePicture', {
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
    async updateAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('No file provided')
        const user = req.user as any
        const { user: updated } = await this.userService.updateAvatar(user.userId, file)
        return successResponse('Avatar updated', updated)
    }
}
