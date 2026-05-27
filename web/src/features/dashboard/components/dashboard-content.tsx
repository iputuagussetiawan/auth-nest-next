'use client'

import { useAuthContext } from '@/providers/auth-provider'

import { AdminDashboard } from './admin-dashboard'
import { CompanyDashboard } from './company-dashboard'
import { JobseekerDashboard } from './jobseeker-dashboard'
import { UserDashboard } from './user-dashboard'

export function DashboardContent() {
    const { user } = useAuthContext()

    if (!user) return null

    switch (user.role) {
        case 'admin':
            return <AdminDashboard />
        case 'company':
            return <CompanyDashboard />
        case 'jobseeker':
            return <JobseekerDashboard />
        default:
            return <UserDashboard user={user} />
    }
}
