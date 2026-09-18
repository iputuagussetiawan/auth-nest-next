import type { ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GalleryVerticalEnd } from 'lucide-react'

import { adminSiteSettingsService } from '@/features/admin/site-settings/services/SiteSettingsService'

const DEFAULT_SITE_NAME = 'App'

async function getSiteInfo() {
    try {
        const res = await adminSiteSettingsService.get()
        return { siteName: res.data?.siteName || DEFAULT_SITE_NAME, logoUrl: res.data?.logoUrl }
    } catch {
        return { siteName: DEFAULT_SITE_NAME, logoUrl: null }
    }
}

export default async function AuthLayout({ children }: { children: ReactNode }) {
    const { siteName, logoUrl } = await getSiteInfo()

    return (
        <div className="grid min-h-svh lg:grid-cols-4">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <Link href="/" className="flex items-center gap-2 font-medium">
                        {logoUrl ? (
                            <Image
                                src={logoUrl}
                                alt={siteName}
                                width={180}
                                height={32}
                                unoptimized
                                className="h-8 w-auto max-w-[180px] object-contain"
                            />
                        ) : (
                            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                        )}
                        {siteName}
                    </Link>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">{children}</div>
                </div>
            </div>
            <div className="bg-muted relative col-span-3 hidden lg:block">
                <Image
                    src="/images/pages/signup/bg-signup.png"
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 75vw, 0px"
                    className="object-cover"
                />
            </div>
        </div>
    )
}
