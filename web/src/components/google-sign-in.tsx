'use client'

import React, { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { GoogleIcon } from './icon/social-icons'

export const GoogleSignInButton = () => {
    const [isLoading, setIsLoading] = useState(false)

    const handleGoogleSignIn = () => {
        setIsLoading(true)
        const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL || 'http://localhost:3000'
        window.location.assign(`${appBaseUrl}/api/auth/google`)
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
