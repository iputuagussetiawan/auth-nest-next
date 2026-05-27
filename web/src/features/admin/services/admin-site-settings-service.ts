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
}
