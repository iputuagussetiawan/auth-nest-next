import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsString, IsUrl } from 'class-validator'
import { memoryStorage } from 'multer'

import { successResponse } from '../../common/helpers/response.helper'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { CloudinaryService } from '../../shared/cloudinary/cloudinary.service'
import { SiteSettingsService } from './site-settings.service'
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto'

const MAX_SIZE = 5 * 1024 * 1024
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/x-icon', 'image/vnd.microsoft.icon']

class DeleteAssetDto {
    @IsString() url: string
}

@ApiTags('site-settings')
@Controller('site-settings')
export class SiteSettingsController {
    constructor(
        private service: SiteSettingsService,
        private cloudinary: CloudinaryService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Get site settings (public)' })
    async get() {
        const data = await this.service.get()
        return successResponse('Site settings', data)
    }

    @Patch()
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Update site settings' })
    async update(@Body() dto: UpdateSiteSettingsDto) {
        const data = await this.service.update(dto)
        return successResponse('Site settings updated', data)
    }

    @Post('upload')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Upload logo or favicon — deletes oldUrl from Cloudinary if provided' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                oldUrl: { type: 'string', description: 'Previous Cloudinary URL to delete' },
            },
            required: ['file'],
        },
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: MAX_SIZE },
            fileFilter: (_req, file, cb) => {
                if (!ALLOWED_MIME.includes(file.mimetype)) {
                    return cb(new BadRequestException('Only image files are allowed (JPEG, PNG, WebP, SVG, ICO)'), false)
                }
                cb(null, true)
            },
        }),
    )
    async uploadAsset(
        @UploadedFile() file: Express.Multer.File,
        @Body('oldUrl') oldUrl?: string,
    ) {
        if (!file) throw new BadRequestException('No file provided')

        // Upload new image first — if it fails, old image is untouched
        const result = await this.cloudinary.upload(file, 'site-assets')

        // Delete old only after new upload succeeds
        if (oldUrl?.startsWith('http')) {
            await this.cloudinary.delete(oldUrl)
        }

        return successResponse('Uploaded', { url: result.secure_url })
    }

    @Delete('asset')
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    @ApiOperation({ summary: 'Delete a Cloudinary asset by URL' })
    async deleteAsset(@Body() dto: DeleteAssetDto) {
        if (!dto.url?.startsWith('http')) throw new BadRequestException('Invalid URL')
        await this.cloudinary.delete(dto.url)
        return successResponse('Asset deleted')
    }
}
