export interface IThemeVars {
    background: string
    foreground: string
    card: string
    cardForeground: string
    popover: string
    popoverForeground: string
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    muted: string
    mutedForeground: string
    accent: string
    accentForeground: string
    destructive: string
    border: string
    input: string
    ring: string
    chart1: string
    chart2: string
    chart3: string
    chart4: string
    chart5: string
    sidebar: string
    sidebarForeground: string
    sidebarPrimary: string
    sidebarPrimaryForeground: string
    sidebarAccent: string
    sidebarAccentForeground: string
    sidebarBorder: string
    sidebarRing: string
}

export interface IThemeConfig {
    light: IThemeVars
    dark: IThemeVars
    radius: string
    fontFamily: string
    heroVariant: 'centered' | 'fullwidth'
    heroBackground: 'gradient' | 'solid' | 'mesh'
}

export interface ITheme {
    id: string
    name: string
    slug: string
    isActive: boolean
    config: IThemeConfig
    createdAt: string
    updatedAt: string
}

export interface IThemesResponse {
    status: string
    message: string
    data: ITheme[]
}

export interface IThemeResponse {
    status: string
    message: string
    data: ITheme
}
