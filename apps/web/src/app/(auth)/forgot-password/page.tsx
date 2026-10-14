import { Suspense } from 'react'
import type { Metadata } from 'next'

import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Forgot Password',
    description: 'Reset your account password.',
}

export default function ForgotPasswordPage() {
    return (
        <Suspense>
            <ForgotPasswordForm />
        </Suspense>
    )
}
