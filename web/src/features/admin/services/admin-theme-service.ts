import { api } from '@/lib/api-factory'
import type { IThemesResponse, IThemeResponse, IThemeConfig } from '../types/admin-types'

export const adminThemeService = {
    getAll: () =>
        api.API<IThemesResponse>('/api/themes', { method: 'GET', cache: 'no-store' }),

    create: (data: { name: string; slug: string; isActive?: boolean; config: IThemeConfig }) =>
        api.API<IThemeResponse>('/api/themes', { method: 'POST', body: JSON.stringify(data), cache: 'no-store' }),

    update: (id: string, data: { name?: string; slug?: string; isActive?: boolean; config?: IThemeConfig }) =>
        api.API<IThemeResponse>(`/api/themes/${id}`, { method: 'PATCH', body: JSON.stringify(data), cache: 'no-store' }),

    activate: (id: string) =>
        api.API<IThemeResponse>(`/api/themes/${id}/activate`, { method: 'PATCH', cache: 'no-store' }),

    delete: (id: string) =>
        api.API<any>(`/api/themes/${id}`, { method: 'DELETE', cache: 'no-store' }),

    listPublic: () =>
        api.API<IThemesResponse>('/api/themes/list', { method: 'GET', cache: 'no-store' }),

    getMyTheme: () =>
        api.API<IThemeResponse>('/api/themes/my', { method: 'GET', cache: 'no-store' }),

    setPreference: (themeId: string) =>
        api.API<any>('/api/themes/preference', { method: 'PATCH', body: JSON.stringify({ themeId }), cache: 'no-store' }),
}
