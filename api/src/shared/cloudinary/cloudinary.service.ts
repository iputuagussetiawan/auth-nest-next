import { Injectable } from '@nestjs/common'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import { Readable } from 'stream'

@Injectable()
export class CloudinaryService {
    upload(file: Express.Multer.File, folder = 'profile-pictures'): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: 'image' },
                (error, result) => {
                    if (error || !result) return reject(error ?? new Error('Upload failed'))
                    resolve(result)
                },
            )
            Readable.from(file.buffer).pipe(stream)
        })
    }

    async delete(url: string): Promise<void> {
        const publicId = this.extractPublicId(url)
        if (!publicId) return
        await cloudinary.uploader.destroy(publicId, { invalidate: true }).catch((err) => {
            console.error(`Cloudinary delete failed for ${publicId}:`, err)
        })
    }

    private extractPublicId(url: string): string | null {
        const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
        return match ? match[1] : null
    }
}
