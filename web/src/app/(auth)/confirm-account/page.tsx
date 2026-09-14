import type { Metadata } from 'next'
import { Suspense } from 'react'

import { ConfirmAccountForm } from '@/features/auth/components/ConfirmAccountForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Confirm Account',
    description: 'Confirm your email address to activate your account.',
}

export default function ConfirmAccountPage() {
    return (
        <Suspense>
            <ConfirmAccountForm />
        </Suspense>
    )
}
