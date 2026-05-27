import { api } from '@/lib/api-factory'

import type { IAdminUsersResponse } from '../types/admin-types'

export const adminUserService = {
    create: (data: { email: string; password: string; firstName?: string; lastName?: string; roleId?: string; isActive?: boolean }) =>
        api.API<any>('/api/user/admin/users', {
            method: 'POST',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    getAll: (search?: string, page = 1, limit = 20) => {
        const params: Record<string, string | number> = { page, limit }
        if (search) params.search = search
        return api.API<IAdminUsersResponse>('/api/user/admin/users', {
            method: 'GET',
            cache: 'no-store',
            params,
        })
    },

    update: (id: string, data: { firstName?: string; lastName?: string; isActive?: boolean }) =>
        api.API<any>(`/api/user/admin/users/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    delete: (id: string) =>
        api.API<any>(`/api/user/admin/users/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        }),

    assignRole: (userId: string, roleId: string) =>
        api.API<any>(`/api/user/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ roleId }),
            cache: 'no-store',
        }),
}
