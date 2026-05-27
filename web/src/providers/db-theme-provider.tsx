'use client'

import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from 'next-themes'

import type { IThemeConfig, IThemeVars } from '@/features/admin/types/admin-types'
import { api } from '@/lib/api-factory'

const VAR_MAP: Record<keyof IThemeVars, string> = {
    background: '--background', foreground: '--foreground',
    card: '--card', cardForeground: '--card-foreground',
    popover: '--popover', popoverForeground: '--popover-foreground',
    primary: '--primary', primaryForeground: '--primary-foreground',
    secondary: '--secondary', secondaryForeground: '--secondary-foreground',
    muted: '--muted', mutedForeground: '--muted-foreground',
    accent: '--accent', accentForeground: '--accent-foreground',
    destructive: '--destructive',
    border: '--border', input: '--input', ring: '--ring',
    chart1: '--chart-1', chart2: '--chart-2', chart3: '--chart-3', chart4: '--chart-4', chart5: '--chart-5',
    sidebar: '--sidebar', sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary', sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent', sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border', sidebarRing: '--sidebar-ring',
}

function applyTheme(config: IThemeConfig, isDark: boolean) {
    const root = document.documentElement
    const vars = isDark ? config.dark : config.light
    for (const [key, cssVar] of Object.entries(VAR_MAP)) {
        root.style.setProperty(cssVar, (vars as any)[key])
    }
    root.style.setProperty('--radius', `${config.radius}rem`)
}

export function DbThemeProvider({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme()

    const { data } = useQuery({
        queryKey: ['active-theme'],
        queryFn: () => api.API<{ data: { config: IThemeConfig } }>('/api/themes/active', { method: 'GET', cache: 'no-store' }),
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        const config = data?.data?.config
        if (!config?.light || !config?.dark) return
        applyTheme(config, resolvedTheme === 'dark')
    }, [data, resolvedTheme])

    return <>{children}</>
}
