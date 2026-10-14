'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { UiButton } from '@/components/ui-custom/UiButton'

import { GoogleIcon } from './icon/social-icons'

export const GoogleSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = () => {
        setIsLoading(true)
        // Go through our own /api proxy so the auth cookies the callback sets land on this
        // domain; navigating to the API's domain would set them where the web app can't read them.
        // A full page load is needed (it's an API route that redirects to Google), not router.push.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign('/api/auth/google')
    }

    return (
        <UiButton
            variant="outline"
            type="button"
            className="flex w-full items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon size={20} />}
            {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </UiButton>
    )
}
