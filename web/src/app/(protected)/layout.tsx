import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { AUTH_COOKIE_NAME, SIGNIN_URL } from '@/lib/constants'

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) redirect(SIGNIN_URL)

    return <>{children}</>
}
