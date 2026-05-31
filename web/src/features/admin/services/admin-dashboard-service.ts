import { api } from '@/lib/api-factory'
import type { IDashboardStatsResponse } from '../types/admin-types'

export const adminDashboardService = {
    getStats: () =>
        api.API<IDashboardStatsResponse>('/api/admin/stats', { method: 'GET', cache: 'no-store' }),
}
