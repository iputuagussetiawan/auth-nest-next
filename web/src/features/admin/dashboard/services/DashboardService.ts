import { api } from '@/lib/api-factory'

import type { IDashboardStatsResponse } from '../types/DashboardTypes'

export const adminDashboardService = {
    getStats: () =>
        api.API<IDashboardStatsResponse>('/api/admin/stats', { method: 'GET', cache: 'no-store' }),
}
