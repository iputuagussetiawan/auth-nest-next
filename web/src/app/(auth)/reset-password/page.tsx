import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Reset Password',
    description: 'Set a new password for your account.',
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    )
}
