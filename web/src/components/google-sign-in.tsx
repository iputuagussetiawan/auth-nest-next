'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react' // For the loading spinner

import { Button } from '@/components/ui/button'

import { GoogleIcon } from './icon/social-icons'

export const GoogleSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = () => {
        setIsLoading(true)

        // 1. Determine the backend URL
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
        const authUrl = `${apiBaseUrl}/auth/google`

        // 2. Redirect to the Express/Passport.js endpoint
        // We use .assign() to keep it in the same tab for a better mobile experience
        window.location.assign(authUrl)
    }

    return (
        <Button
            variant="outline"
            type="button"
            className="flex w-full items-center justify-center gap-2"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon size={20} />}
            {isLoading ? 'Connecting to Google...' : 'Continue with Google'}
        </Button>
    )
}
