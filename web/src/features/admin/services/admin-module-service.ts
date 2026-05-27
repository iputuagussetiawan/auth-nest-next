import { api } from '@/lib/api-factory'
import type { IAppModulesResponse } from '../types/admin-types'

export const adminModuleService = {
    // Any authenticated user — only returns modules they can access
    getMyModules: () =>
        api.API<IAppModulesResponse>('/api/app-modules/my', { method: 'GET', cache: 'no-store' }),

    // Admin only
    getAll: () =>
        api.API<IAppModulesResponse>('/api/app-modules', { method: 'GET', cache: 'no-store' }),

    create: (data: {
        name: string; slug: string; path: string
        icon?: string; description?: string; isActive?: boolean
        roleIds?: string[]; permissionIds?: string[]
    }) =>
        api.API<any>('/api/app-modules', { method: 'POST', body: JSON.stringify(data), cache: 'no-store' }),

    update: (id: string, data: {
        name?: string; slug?: string; path?: string
        icon?: string; description?: string; isActive?: boolean
        roleIds?: string[]; permissionIds?: string[]
    }) =>
        api.API<any>(`/api/app-modules/${id}`, { method: 'PATCH', body: JSON.stringify(data), cache: 'no-store' }),

    delete: (id: string) =>
        api.API<any>(`/api/app-modules/${id}`, { method: 'DELETE', cache: 'no-store' }),

    reorder: (ids: string[]) =>
        api.API<any>('/api/app-modules/reorder', { method: 'PATCH', body: JSON.stringify({ ids }), cache: 'no-store' }),
}
