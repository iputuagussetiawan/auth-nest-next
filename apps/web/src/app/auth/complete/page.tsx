'use client'

import { Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

import { DASHBOARD_URL, ONBOARDING_URL } from '@/lib/constants'

// Only these destinations are accepted so ?next= can't be used as an open redirect
const ALLOWED_DESTINATIONS = [DASHBOARD_URL, ONBOARDING_URL]

function CompleteSignIn() {
    const next = useSearchParams().get('next')

    useEffect(() => {
        // The Google OAuth redirect chain is cross-site, so SameSite=Strict auth cookies were not
        // sent with it. This navigation starts from our own page, so the browser sends them.
        const destination = ALLOWED_DESTINATIONS.includes(next ?? '') ? next! : DASHBOARD_URL
        window.location.replace(destination)
    }, [next])

    return null
}

export default function CompleteSignInPage() {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
            <Suspense>
                <CompleteSignIn />
            </Suspense>
        </div>
    )
}
