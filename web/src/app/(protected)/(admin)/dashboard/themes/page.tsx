import { Suspense } from 'react'
import type { Metadata } from 'next'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { ErrorBoundary } from 'react-error-boundary'

import { ThemesError } from '@/features/admin/themes/components/ThemesError'
import { ThemesLoading } from '@/features/admin/themes/components/ThemesLoading'
import { adminThemeService } from '@/features/admin/themes/services/ThemeService'
import { ThemesPage } from '@/features/admin/themes/ThemesPage'
import { getQueryClient } from '@/lib/get-query-client'

export const metadata: Metadata = { title: 'Themes' }

export default async function AdminThemesPage() {
    const queryClient = getQueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['admin-themes'],
        queryFn: () => adminThemeService.getAll(),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <Suspense fallback={<ThemesLoading />}>
                <ErrorBoundary FallbackComponent={ThemesError}>
                    <ThemesPage />
                </ErrorBoundary>
            </Suspense>
        </HydrationBoundary>
    )
}
