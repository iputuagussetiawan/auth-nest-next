export interface IDashboardStats {
    totalUsers: number
    activeUsers: number
    unverifiedEmails: number
    activeSessions: number
    totalRoles: number
    totalPermissions: number
    usersByRole: { role: string; count: number }[]
    userGrowth: { month: string; users: number; sessions: number }[]
}

export interface IDashboardStatsResponse {
    status: string
    message: string
    data: IDashboardStats
}
