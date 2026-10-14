'use client'

import { useAuthContext } from '@/providers/auth-provider'

import { AdminDashboard } from './AdminDashboard'
import { CompanyDashboard } from './CompanyDashboard'
import { JobseekerDashboard } from './JobseekerDashboard'
import { UserDashboard } from './UserDashboard'

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
