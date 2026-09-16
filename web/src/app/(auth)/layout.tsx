import type { ReactNode } from 'react'
import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'

import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'

const DEFAULT_SITE_NAME = 'App'

async function getSiteName() {
    try {
        const res = await adminSiteSettingsService.get()
        return res.data?.siteName || DEFAULT_SITE_NAME
    } catch {
        return DEFAULT_SITE_NAME
    }
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const siteName = await getSiteName()

    return (
        <div className="grid min-h-svh lg:grid-cols-4">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                            <GalleryVerticalEnd className="size-4" />
                        </div>
                        {siteName}
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
            </div>
            <div className="bg-muted relative col-span-3 hidden lg:block">
                <img
                    src="/images/pages/signup/bg-signup.png"
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover"
                />
            </div>
        </div>
    )
}
