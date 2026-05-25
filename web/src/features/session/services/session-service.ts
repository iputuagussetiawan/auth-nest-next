import type { IUserProfileResponse } from '@/features/user/types/user-type'
import { api } from '@/lib/api-factory'

import type { ISessionDeleteResponse, ISessionResponse } from '../types/session-type'

export const sessionService = {
    getAll: () =>
        api.API<ISessionResponse>('/api/session/all', {
            method: 'GET',
            cache: 'no-store',
        }),
    get: () =>
        api.API<IUserProfileResponse>('/api/session', {
            method: 'GET',
            cache: 'no-store',
        }),
    delete: (id: string) =>
        api.API<ISessionDeleteResponse>(`/api/session/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        }),
}
