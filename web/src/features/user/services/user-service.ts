import { api } from '@/lib/api-factory'

import type { IUserProfileResponse } from '../types/user-type'

export const userService = {
    getMe: () =>
        api.API<IUserProfileResponse>('/api/user/me', {
            method: 'GET',
            cache: 'no-store',
        }),

    updateProfile: (data: { firstName?: string; lastName?: string }) =>
        api.API<IUserProfileResponse>('/api/user/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),

    updateAvatar: (file: File) => {
        const formData = new FormData()
        formData.append('profilePicture', file)
        return api.API<IUserProfileResponse>('/api/user/avatar', {
            method: 'PATCH',
            body: formData,
            cache: 'no-store',
        })
    },

    updatePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
        api.API<any>('/api/user/password', {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
}
