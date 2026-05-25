import { api } from '@/lib/api-factory'

import type { IUserProfileResponse, updateProfileDTO } from '../types/user-type'

export const userService = {
    getMe: () =>
        api.API<IUserProfileResponse>('/api/user/me', {
            method: 'GET',
            cache: 'no-store',
        }),

    updateAvatar: (formData: FormData) =>
        api.API<IUserProfileResponse>('/api/user/avatar', {
            method: 'PATCH',
            body: formData,
            cache: 'no-store',
        }),

    updateProfile: (data: updateProfileDTO) =>
        api.API<IUserProfileResponse>('/api/user/profile', {
            method: 'PATCH',
            body: JSON.stringify(data),
            cache: 'no-store',
        }),
}
