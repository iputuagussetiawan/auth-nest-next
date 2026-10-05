'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { UiButton } from '@/components/ui-custom/UiButton'

import { GoogleIcon } from './icon/social-icons'

export const GoogleSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = () => {
        setIsLoading(true)
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
        const authUrl = `${apiBaseUrl}/auth/google`
        window.location.assign(authUrl)
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
