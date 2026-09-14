import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { HydrationBoundary, dehydrate } from '@tanstack/react-query'

import { SiteSettingsError } from '@/features/admin/site-settings/components/SiteSettingsError'
import { SiteSettingsLoading } from '@/features/admin/site-settings/components/SiteSettingsLoading'
import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'
import { SiteSettingsPage } from '@/features/admin/site-settings/SiteSettingsPage'
import { getQueryClient } from '@/lib/get-query-client'

export const metadata: Metadata = { title: 'Site Settings' }

export default async function AdminSiteSettingsPage() {
    const queryClient = getQueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['site-settings'],
        queryFn: () => adminSiteSettingsService.get(),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<SiteSettingsLoading />}>
                <ErrorBoundary FallbackComponent={SiteSettingsError}>
                    <SiteSettingsPage />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
