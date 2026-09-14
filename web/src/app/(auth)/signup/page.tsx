import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SignupForm } from '@/features/auth/components/SignupForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create a free account and get started.',
}

export default function SignupPage() {
    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    )
}
