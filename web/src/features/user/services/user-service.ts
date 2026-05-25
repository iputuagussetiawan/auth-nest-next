import { api } from '@/lib/api-factory'

import type { IUserProfileResponse } from '../types/user-type'

export const userService = {
    getMe: () =>
        api.API<IUserProfileResponse>('/api/user/me', {
            method: 'GET',
            cache: 'no-store',
        }),

    update: (formData: FormData) =>
        api.API<IUserProfileResponse>('/api/user', {
            method: 'PATCH',
            body: formData,
            cache: 'no-store',
        }),
}
