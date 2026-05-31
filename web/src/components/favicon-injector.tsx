'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { adminSiteSettingsService } from '@/features/admin/services/admin-site-settings-service'

export function FaviconInjector() {
    const { data } = useQuery({
        queryKey: ['site-settings'],
        queryFn: () => adminSiteSettingsService.get(),
        staleTime: 5 * 60_000,
    })

    const faviconUrl = data?.data?.faviconUrl

    useEffect(() => {
        const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
            ?? (() => {
                const el = document.createElement('link')
                el.rel = 'icon'
                document.head.appendChild(el)
                return el
            })()
        if (faviconUrl) {
            link.href = faviconUrl
        } else {
            link.href = '/favicon.ico'
        }
    }, [faviconUrl])

    return null
}
