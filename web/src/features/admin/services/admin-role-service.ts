import { api } from '@/lib/api-factory'

import type { IPermissionsResponse, IRolesResponse, IRolesWithPermissionsResponse } from '../types/admin-types'

export const adminRoleService = {
    getAll: () =>
        api.API<IRolesResponse>('/api/roles', { method: 'GET', cache: 'no-store' }),

    getAllWithPermissions: () =>
        api.API<IRolesWithPermissionsResponse>('/api/roles/with-permissions', { method: 'GET', cache: 'no-store' }),

    getPermissions: (roleId: string) =>
        api.API<IPermissionsResponse>(`/api/roles/${roleId}/permissions`, {
            method: 'GET',
            cache: 'no-store',
        }),

    create: (data: { name: string; description?: string }) =>
        api.API<any>('/api/roles', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    update: (id: string, data: { name: string; description?: string }) =>
        api.API<any>(`/api/roles/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    delete: (id: string) =>
        api.API<any>(`/api/roles/${id}`, { method: 'DELETE', cache: 'no-store' }),

    assignPermissions: (roleId: string, permissionIds: string[]) =>
        api.API<any>(`/api/roles/${roleId}/permissions`, {
            method: 'POST',
            body: JSON.stringify({ permissionIds }),
            cache: 'no-store',
        }),

    uploadImage: (roleId: string, file: File) => {
        const form = new FormData()
        form.append('image', file)
        return api.API<any>(`/api/roles/${roleId}/image`, {
            method: 'PATCH',
            body: form,
            cache: 'no-store',
        })
    },
}
