import { Suspense } from 'react'
import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import { adminRoleService } from '@/features/admin/roles/services/RoleService'
import { UsersError } from '@/features/admin/users/components/UsersError'
import { UsersLoading } from '@/features/admin/users/components/UsersLoading'
import { adminUserService } from '@/features/admin/users/services/UserService'
import { UsersPage } from '@/features/admin/users/UsersPage'
import { getQueryClient } from '@/lib/get-query-client'

export const metadata: Metadata = { title: 'Users' }

export default async function AdminUsersPage() {
    const queryClient = getQueryClient()

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['admin-users'],
            queryFn: () => adminUserService.getAll(),
        }),
        queryClient.prefetchQuery({
            queryKey: ['admin-roles'],
            queryFn: () => adminRoleService.getAll(),
        }),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<UsersLoading />}>
                <ErrorBoundary FallbackComponent={UsersError}>
                    <UsersPage />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
