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
        if (!faviconUrl) return
        let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']")
        if (!link) {
            link = document.createElement('link')
            link.rel = 'icon'
            document.head.appendChild(link)
        }
        link.href = faviconUrl
    }, [faviconUrl])

    return null
}
