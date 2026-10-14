import { api } from '@/lib/api-factory'

import type { ISessionDeleteResponse, ISessionResponse } from '../types/SessionType'

export const sessionService = {
    getAll: () =>
        api.API<ISessionResponse>('/api/sessions', {
            method: 'GET',
            cache: 'no-store',
        }),
    delete: (id: string) =>
        api.API<ISessionDeleteResponse>(`/api/sessions/${id}`, {
            method: 'DELETE',
            cache: 'no-store',
        }),
    revokeOthers: () =>
        api.API<ISessionDeleteResponse>('/api/sessions/others', {
            method: 'DELETE',
            cache: 'no-store',
        }),
}
