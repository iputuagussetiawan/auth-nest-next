import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { PermissionsError } from '@/features/admin/permissions/components/PermissionsError'
import { PermissionsLoading } from '@/features/admin/permissions/components/PermissionsLoading'
import { PermissionsPage } from '@/features/admin/permissions/PermissionsPage'
import { adminPermissionService } from '@/features/admin/permissions/services/PermissionService'
import { adminRoleService } from '@/features/admin/roles/services/RoleService'
import { getQueryClient } from '@/lib/get-query-client'

export const metadata: Metadata = { title: 'Permissions' }

export default async function AdminPermissionsPage() {
    const queryClient = getQueryClient()

    await Promise.all([
        queryClient.prefetchQuery({
            queryKey: ['admin-permissions'],
            queryFn: () => adminPermissionService.getAll(),
        }),
        queryClient.prefetchQuery({
            queryKey: ['admin-roles-with-permissions'],
            queryFn: () => adminRoleService.getAllWithPermissions(),
        }),
    ])

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<PermissionsLoading />}>
                <ErrorBoundary FallbackComponent={PermissionsError}>
                    <PermissionsPage />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
