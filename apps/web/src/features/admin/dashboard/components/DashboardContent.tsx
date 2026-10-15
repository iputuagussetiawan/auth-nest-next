'use client'

import { useAuthContext } from '@/providers/auth-provider'
import { PERMISSIONS } from '@nest-auth/shared'

import { hasPermission } from '@/lib/permissions'

import { AdminDashboard } from './AdminDashboard'
import { CompanyDashboard } from './CompanyDashboard'
import { JobseekerDashboard } from './JobseekerDashboard'
import { UserDashboard } from './UserDashboard'

export function DashboardContent() {
    const { user } = useAuthContext()

    if (!user) return null
    // Admins, and any role granted stats:read, get the stats dashboard
    if (hasPermission(user, PERMISSIONS.STATS_READ)) return <AdminDashboard />

    switch (user.role) {
        case 'company':
            return <CompanyDashboard />
        case 'jobseeker':
            return <JobseekerDashboard />
        default:
            return <UserDashboard user={user} />
    }
}
