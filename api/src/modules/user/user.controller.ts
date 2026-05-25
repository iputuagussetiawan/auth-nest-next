import {
    BadRequestException,
    Body,
    Controller,
    Get,
    Patch,
    Req,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { Request } from 'express'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { UserService } from './user.service'
import { UpdateProfileDto } from './dto/update-profile.dto'
import { UpdatePasswordDto } from './dto/update-password.dto'

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
