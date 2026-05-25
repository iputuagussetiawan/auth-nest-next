import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'

import { AUTH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'
import { userService } from '@/features/user/services/user-service'
import { AuthProvider } from '@/providers/auth-provider'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) redirect(SIGNIN_URL)

    const queryClient = new QueryClient()

    await queryClient.prefetchQuery({
        queryKey: ['user'],
        queryFn: userService.getMe,
    })

    const dehydratedState = dehydrate(queryClient)

    return (
        <HydrationBoundary state={dehydratedState}>
            <AuthProvider>{children}</AuthProvider>
        </HydrationBoundary>
    )
}
