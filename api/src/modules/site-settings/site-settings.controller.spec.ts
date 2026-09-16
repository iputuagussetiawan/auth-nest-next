import { BadRequestException } from '@nestjs/common'
import { SiteSettingsController } from './site-settings.controller'

describe('SiteSettingsController', () => {
    const service = { get: jest.fn(), update: jest.fn() }
    const cloudinary = { upload: jest.fn(), delete: jest.fn() }
    const controller = new SiteSettingsController(service as never, cloudinary as never)

    beforeEach(() => jest.clearAllMocks())

    it('wraps get and update responses', async () => {
        service.get.mockResolvedValue({ siteName: 'Acme' })
        service.update.mockResolvedValue({ siteName: 'New' })
        await expect(controller.get()).resolves.toEqual({ status: 'success', message: 'Site settings', data: { siteName: 'Acme' } })
        await expect(controller.update({ siteName: 'New' } as never)).resolves.toEqual({ status: 'success', message: 'Site settings updated', data: { siteName: 'New' } })
    })

    it('uploads before deleting the old valid asset', async () => {
        const file = { mimetype: 'image/png' }
        cloudinary.upload.mockResolvedValue({ secure_url: 'https://cdn.test/new.png' })
        await expect(controller.uploadAsset(file as never, 'https://cdn.test/old.png')).resolves.toEqual({ status: 'success', message: 'Uploaded', data: { url: 'https://cdn.test/new.png' } })
        expect(cloudinary.upload).toHaveBeenCalledWith(file, 'site-assets')
        expect(cloudinary.delete).toHaveBeenCalledWith('https://cdn.test/old.png')
    })

    it('rejects missing files and invalid delete URLs', async () => {
        await expect(controller.uploadAsset(undefined as never)).rejects.toBeInstanceOf(BadRequestException)
        await expect(controller.deleteAsset({ url: 'not-a-url' })).rejects.toBeInstanceOf(BadRequestException)
    })

    it('deletes valid assets', async () => {
        await expect(controller.deleteAsset({ url: 'http://cdn.test/old.png' })).resolves.toEqual({ status: 'success', message: 'Asset deleted', data: null })
        expect(cloudinary.delete).toHaveBeenCalledWith('http://cdn.test/old.png')
    })
})
