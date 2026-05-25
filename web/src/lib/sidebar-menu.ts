import {
    BookOpen,
    Briefcase,
    FileUser,
    GalleryVerticalEnd,
    LayoutDashboard,
    PieChart,
    Search,
    Settings2,
} from 'lucide-react'

import type { IUserProfile } from '@/features/user/types/user-type'
import type { NavMainGroup } from '@/components/nav-main'

function canAccess(
    item: { roles?: string[]; permissions?: string[] },
    roleName?: string,
    userPermissions?: string[],
): boolean {
    if (!item.roles?.length && !item.permissions?.length) return true
    if (roleName && item.roles?.includes(roleName)) return true
    if (userPermissions?.some((p) => item.permissions?.includes(p))) return true
    return false
}

export const getSidebarData = (user?: IUserProfile) => {
    const roleName = user?.role?.name
    const userPermissions = user?.permissions ?? []

    const isAdmin = roleName === 'ADMIN'
    const isJobSeeker = roleName === 'JOBSEEKER'

    const allNavItems: {
        group: string | undefined
        roles?: string[]
        permissions?: string[]
        item: NavMainGroup['items'][number]
    }[] = [
        // --- General (all users) ---
        {
            group: undefined,
            item: {
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutDashboard,
                items: [
                    { title: 'Analytics', url: '/dashboard/analytics' },
                    { title: 'Data Statistics', url: '/dashboard/statistics' },
                ],
            },
        },
        // --- Job Seeker ---
        {
            group: undefined,
            roles: ['JOBSEEKER'],
            item: {
                title: 'My Resume',
                url: '#',
                icon: FileUser,
                items: [
                    { title: 'View CV', url: '/cv/preview' },
                    { title: 'Manage CV', url: '/cv/manage' },
                ],
            },
        },
        {
            group: undefined,
            roles: ['JOBSEEKER'],
            item: {
                title: 'Job Search',
                url: '#',
                icon: Search,
                items: [
                    { title: 'Browse Jobs', url: '/jobs' },
                    { title: 'Applied Jobs', url: '/jobs/applied' },
                    { title: 'Saved', url: '/jobs/saved' },
                ],
            },
        },
        {
            group: undefined,
            roles: ['JOBSEEKER'],
            item: {
                title: 'My Career',
                url: '#',
                icon: Briefcase,
                items: [
                    { title: 'Career Path', url: '/career/path' },
                    { title: 'Skill Up', url: '/career/skills' },
                    { title: 'Experience Up', url: '/career/experience' },
                    { title: 'Target Achieved', url: '/career/targets' },
                ],
            },
        },
        // --- Settings (all users, but admin gets extra sub-item) ---
        {
            group: undefined,
            item: {
                title: 'Settings',
                url: '#',
                icon: Settings2,
                items: [
                    { title: 'General', url: '/settings' },
                    { title: 'Security', url: '/settings/security' },
                    ...(isAdmin ? [{ title: 'System Limits', url: '/settings/limits' }] : []),
                ],
            },
        },
        // --- Administration ---
        {
            group: 'Administration',
            roles: ['ADMIN'],
            permissions: ['user:read'],
            item: {
                title: 'Management',
                url: '#',
                icon: Briefcase,
                items: [
                    { title: 'All Users', url: '/admin/users' },
                    { title: 'Job Listings', url: '/admin/jobs' },
                    { title: 'Reports', url: '/admin/reports' },
                ],
            },
        },
    ]

    // Build grouped nav structure
    const groupMap = new Map<string | undefined, NavMainGroup>()

    for (const entry of allNavItems) {
        if (
            !canAccess(
                { roles: entry.roles, permissions: entry.permissions },
                roleName,
                userPermissions,
            )
        ) {
            continue
        }

        const key = entry.group
        if (!groupMap.has(key)) {
            groupMap.set(key, { label: key, items: [] })
        }
        groupMap.get(key)!.items.push(entry.item)
    }

    const navGroups = Array.from(groupMap.values()).filter((g) => g.items.length > 0)

    return {
        teams: [{ name: 'Acme Inc', logo: GalleryVerticalEnd, plan: 'Enterprise' }],
        navGroups,
        projects: [
            { name: 'Documentation', url: '/docs', icon: BookOpen },
            ...(canAccess(
                { roles: ['ADMIN'], permissions: ['analytics:read'] },
                roleName,
                userPermissions,
            )
                ? [{ name: 'Sales & Marketing', url: '#', icon: PieChart }]
                : []),
        ],
    }
}
