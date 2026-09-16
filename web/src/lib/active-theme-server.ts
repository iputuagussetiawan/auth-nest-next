import type { IThemeConfig } from '@/features/admin/themes/types/ThemeTypes'

const API_BASE_URL = process.env.BACKEND_URL || 'http://localhost:8000/api'

export async function getActiveThemeConfig(): Promise<IThemeConfig | null> {
    try {
        const response = await fetch(`${API_BASE_URL}/themes/active`, {
            cache: 'no-store',
            signal: AbortSignal.timeout(5000),
        })
        if (!response.ok) return null
        const json = await response.json()
        return json?.data?.config ?? null
    } catch {
        return null
    }
}

const VAR_MAP: Record<string, string> = {
    background: '--background', foreground: '--foreground',
    card: '--card', cardForeground: '--card-foreground',
    popover: '--popover', popoverForeground: '--popover-foreground',
    primary: '--primary', primaryForeground: '--primary-foreground',
    secondary: '--secondary', secondaryForeground: '--secondary-foreground',
    muted: '--muted', mutedForeground: '--muted-foreground',
    accent: '--accent', accentForeground: '--accent-foreground',
    destructive: '--destructive', border: '--border', input: '--input', ring: '--ring',
    chart1: '--chart-1', chart2: '--chart-2', chart3: '--chart-3', chart4: '--chart-4', chart5: '--chart-5',
    sidebar: '--sidebar', sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary', sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent', sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border', sidebarRing: '--sidebar-ring',
}

function cssBlock(selector: string, vars: Record<string, string>, radius: string) {
    const declarations = Object.entries(VAR_MAP)
        .map(([key, cssVar]) => vars[key] ? `${cssVar}:${vars[key]}` : '')
        .filter(Boolean)
    declarations.push(`--radius:${radius}rem`)
    return `${selector}{${declarations.join(';')}}`
}

export function getActiveThemeStyle(config: IThemeConfig | null) {
    if (!config?.light || !config.dark) return ''
    return cssBlock(':root', config.light, config.radius) + cssBlock('.dark', config.dark, config.radius)
}
