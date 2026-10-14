import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AuthProvider } from '@/providers/auth-provider'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

import { accountService } from '@/features/admin/account/services/AccountService'
import { AUTH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) redirect(SIGNIN_URL)

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['user'],
        queryFn: accountService.getMe,
    })

    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <AuthProvider>{children}</AuthProvider>
        </HydrationBoundary>
    )
}
