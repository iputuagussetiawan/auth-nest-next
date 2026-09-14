import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { RolesError } from '@/features/admin/roles/components/RolesError'
import { RolesLoading } from '@/features/admin/roles/components/RolesLoading'
import { RolesPage } from '@/features/admin/roles/RolesPage'
import { adminPermissionService } from '@/features/admin/permissions/services/PermissionService'
import { adminRoleService } from '@/features/admin/roles/services/RoleService'
import { getQueryClient } from '@/lib/get-query-client'

export const metadata: Metadata = { title: 'Roles' }

export default async function AdminRolesPage() {
    const queryClient = getQueryClient()

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['admin-roles-with-permissions'],
            queryFn: () => adminRoleService.getAllWithPermissions(),
        }),
        queryClient.prefetchQuery({
            queryKey: ['admin-permissions'],
            queryFn: () => adminPermissionService.getAll(),
        }),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<RolesLoading />}>
                <ErrorBoundary FallbackComponent={RolesError}>
                    <RolesPage />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
