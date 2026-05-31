import { api } from '@/lib/api-factory'
import type { ISiteSettings, ISiteSettingsResponse } from '../types/admin-types'

export const adminSiteSettingsService = {
    get: () =>
        api.API<ISiteSettingsResponse>('/api/site-settings', { method: 'GET', cache: 'no-store' }),

    update: (data: Partial<ISiteSettings>) =>
        api.API<ISiteSettingsResponse>('/api/site-settings', {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    uploadAsset: (file: File, oldUrl?: string): Promise<{ data: { url: string } }> => {
        const form = new FormData()
        form.append('file', file)
        if (oldUrl?.startsWith('http')) form.append('oldUrl', oldUrl)
        return api.API<{ data: { url: string } }>('/api/site-settings/upload', {
            method: 'POST',
            body: form,
            cache: 'no-store',
        })
    },

    deleteAsset: (url: string): Promise<void> =>
        api.API('/api/site-settings/asset', {
            method: 'DELETE',
            body: JSON.stringify({ url }),
            cache: 'no-store',
        }),
}
