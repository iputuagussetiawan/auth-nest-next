import type { Metadata } from 'next'
import { Suspense } from 'react'

import { SignInForm } from '@/features/auth/components/SigninForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Sign In',
    description: 'Sign in to your account.',
}

export default function SigninPage() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    )
}
