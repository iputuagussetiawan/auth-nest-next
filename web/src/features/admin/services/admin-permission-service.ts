import { api } from '@/lib/api-factory'

import type { IPermissionsResponse } from '../types/admin-types'

export const adminPermissionService = {
    getAll: () =>
        api.API<IPermissionsResponse>('/api/permissions', { method: 'GET', cache: 'no-store' }),

    create: (data: { name: string; description?: string }) =>
        api.API<any>('/api/permissions', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    update: (id: string, data: { name: string; description?: string }) =>
        api.API<any>(`/api/permissions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    delete: (id: string) =>
        api.API<any>(`/api/permissions/${id}`, { method: 'DELETE', cache: 'no-store' }),
}
