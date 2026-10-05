import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Wrench } from 'lucide-react'

import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'
import { SignupForm } from '@/features/auth/components/SignupForm'
import { Button } from '@/components/ui/button'
import { SIGNIN_URL } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
    title: 'Create Account',
    description: 'Create a free account and get started.',
}

async function getMaintenance() {
    try {
        const res = await adminSiteSettingsService.get()
        return {
            enabled: res.data?.maintenanceMode ?? false,
            message: res.data?.maintenanceMessage?.trim() || null,
        }
    } catch {
        return { enabled: false, message: null }
    }
}

export default async function SignupPage() {
    // The API also refuses registration during maintenance; this just explains it up front
    const maintenance = await getMaintenance()

    if (maintenance.enabled) {
        return (
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="bg-primary/10 flex size-12 items-center justify-center rounded-xl">
                    <Wrench className="text-primary size-6" />
                </div>
                <h1 className="text-2xl font-bold">Registration paused</h1>
                <p className="text-muted-foreground text-sm text-balance">
                    {maintenance.message ??
                        "We're performing scheduled maintenance. New accounts can be created once we're back."}
                </p>
                <Button variant="outline" className="w-full" asChild>
                    <Link href={SIGNIN_URL}>Back to sign in</Link>
                </Button>
            </div>
        )
    }

    return (
        <Suspense>
            <SignupForm />
        </Suspense>
    )
}
