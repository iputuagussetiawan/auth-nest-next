import type { ReactNode } from 'react'

import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'
import { AuthLogo } from '@/components/auth-logo'
import { AuthShowcase } from '@/components/auth-showcase'
import { InteractiveDots } from '@/components/interactive-dots'

const DEFAULT_SITE_NAME = 'App'

async function getSiteInfo(): Promise<{ siteName: string; logoUrl: string | null }> {
    try {
        const res = await adminSiteSettingsService.get()
        return {
            siteName: res.data?.siteName || DEFAULT_SITE_NAME,
            logoUrl: res.data?.logoUrl ?? null,
        }
    } catch {
        return { siteName: DEFAULT_SITE_NAME, logoUrl: null }
    }
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const { siteName, logoUrl } = await getSiteInfo()

    return (
        <div className="bg-background grid min-h-svh lg:grid-cols-[minmax(420px,1fr)_minmax(0,1.3fr)]">
            <div className="relative isolate flex min-h-svh flex-col gap-4 overflow-hidden px-4 py-6 sm:px-6 md:px-8 xl:px-10">
                <div
                    aria-hidden
                    className="bg-primary/5 pointer-events-none absolute -top-40 -left-40 -z-10 h-[420px] w-[420px] rounded-full blur-3xl"
                />
                <div
                    aria-hidden
                    className="pointer-events-none absolute -right-32 -bottom-40 -z-10 h-[360px] w-[360px] rounded-full bg-violet-500/5 blur-3xl"
                />
                <InteractiveDots />
                <div className="flex justify-center gap-2 sm:justify-start">
                    <AuthLogo siteName={siteName} logoUrl={logoUrl} />
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
            </div>
            <div className="hidden p-3 lg:block">
                <div className="sticky top-3 h-[calc(100svh-1.5rem)] overflow-hidden rounded-3xl">
                    <AuthShowcase siteName={siteName} />
                </div>
            </div>
        </div>
    )
}
